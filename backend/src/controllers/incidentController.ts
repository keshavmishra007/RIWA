import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { IncidentStatus } from '../types/index.js';

export const getIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, priority, status, search, includeClosed, minReports } = req.query;
    let incidents = await db.getIncidents();

    if (category && typeof category === 'string' && category !== 'ALL') {
      incidents = incidents.filter((i) => i.category === category);
    }

    if (priority && typeof priority === 'string' && priority !== 'ALL') {
      incidents = incidents.filter((i) => i.priority === priority);
    }

    // Generic status filtering:
    // If status is explicitly provided and not 'ALL', filter by that specific status.
    // Otherwise by default for operational views (map, dashboard queue), exclude CLOSED incidents.
    if (status && typeof status === 'string') {
      if (status !== 'ALL') {
        incidents = incidents.filter((i) => i.status === status);
      }
    } else if (includeClosed !== 'true') {
      incidents = incidents.filter((i) => i.status !== 'CLOSED');
    }

    // Minimum real citizen reports rule:
    // Operational incidents must have at least 1 real citizen report.
    if (minReports !== undefined) {
      const min = parseInt(String(minReports), 10);
      incidents = incidents.filter((i) => (i.reportCount ?? 0) >= min);
    } else if (status !== 'CLOSED' && status !== 'ALL') {
      incidents = incidents.filter((i) => (i.reportCount ?? 0) > 0);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      incidents = incidents.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.incidentCode.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q)
      );
    }

    res.json(incidents);
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to retrieve incidents.' });
  }
};

export const getIncidentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const incident = await db.getIncidentById(id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found.' });
      return;
    }

    // Retrieve related complaints and explainable fusion scores
    const relatedReports = await db.getIncidentReports(incident.id);
    const statusLogs = await db.getStatusLogs(incident.id);

    // Identify actually fused member reports (root report is the seed with fusionScore = 1.0 or 100)
    const fusedReports = relatedReports.filter(
      (r: any) =>
        (r.fusionScore !== undefined && r.fusionScore < 100 && r.fusionScore > 0) ||
        (r.fusion_score !== undefined && r.fusion_score < 1.0 && r.fusion_score > 0)
    );
    const reportsToAverage = fusedReports.length > 0 ? fusedReports : relatedReports;

    const avgSemantic =
      reportsToAverage.length > 0
        ? reportsToAverage.reduce((acc: number, r: any) => acc + (r.semanticScore ?? r.semantic_score ?? 0.85), 0) /
          reportsToAverage.length
        : 0.85;

    const avgLocation =
      reportsToAverage.length > 0
        ? reportsToAverage.reduce((acc: number, r: any) => acc + (r.locationScore ?? r.location_score ?? 0.90), 0) /
          reportsToAverage.length
        : 0.90;

    const avgTime =
      reportsToAverage.length > 0
        ? reportsToAverage.reduce((acc: number, r: any) => acc + (r.timeScore ?? r.time_score ?? 0.80), 0) /
          reportsToAverage.length
        : 0.85;

    const actualConfidence =
      fusedReports.length > 0
        ? fusedReports.reduce(
            (acc: number, r: any) =>
              acc + (r.fusionScore ? r.fusionScore / 100 : r.fusion_score || 0.85),
            0
          ) / fusedReports.length
        : incident.fusionConfidence <= 1.0 && incident.fusionConfidence > 0
        ? incident.fusionConfidence
        : 0.88;

    const fusionExplanation = {
      semanticScore: parseFloat(avgSemantic.toFixed(2)),
      locationScore: parseFloat(avgLocation.toFixed(2)),
      timeScore: parseFloat(avgTime.toFixed(2)),
      categoryScore: 1.0,
      confidence: parseFloat(actualConfidence.toFixed(2)),
    };

    res.json({
      incident,
      relatedReports,
      fusionExplanation,
      statusLogs,
    });
  } catch (error) {
    console.error('Get incident detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve incident details.' });
  }
};

export const updateIncidentStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, note } = req.body;

    const validStatuses: IncidentStatus[] = [
      'OPEN',
      'ASSIGNED',
      'IN_PROGRESS',
      'RESOLVED',
      'REOPENED',
      'CLOSED',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const updated = await db.updateIncident(id, { status });
    if (!updated) {
      res.status(404).json({ error: 'Incident not found.' });
      return;
    }

    const actorName = req.user?.name || 'Authority Official';

    await db.addStatusLog({
      incidentId: updated.id,
      status,
      actorId: req.user?.userId,
      actorName,
      note: note || `Incident status updated to ${status} by ${actorName}.`,
    });

    res.json({
      success: true,
      incident: updated,
    });
  } catch (error) {
    console.error('Update incident status error:', error);
    res.status(500).json({ error: 'Failed to update incident status.' });
  }
};

export const assignIncidentDepartment = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { departmentName, departmentId, note } = req.body;

    const updated = await db.updateIncident(id, {
      departmentName,
      departmentId,
      status: 'ASSIGNED',
    });

    if (!updated) {
      res.status(404).json({ error: 'Incident not found.' });
      return;
    }

    const actorName = req.user?.name || 'Authority Dispatcher';

    await db.addStatusLog({
      incidentId: updated.id,
      status: 'ASSIGNED',
      actorId: req.user?.userId,
      actorName,
      note: note || `Dispatched to ${departmentName} by ${actorName}. Human authorization confirmed.`,
    });

    res.json({
      success: true,
      incident: updated,
    });
  } catch (error) {
    console.error('Assign department error:', error);
    res.status(500).json({ error: 'Failed to assign department.' });
  }
};
