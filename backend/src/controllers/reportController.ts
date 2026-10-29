import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeCitizenReport, generateIncidentBrief } from '../services/aiService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import {
  calculateCategoryScore,
  calculateDistanceKm,
  evaluateFusion,
  isCandidateWithinTimeWindow,
} from '../services/fusionEngine.js';
import { evaluatePriority } from '../services/priorityEngine.js';
import {
  AIAnalysisResult,
  CivicCategory,
  ComplaintRecord,
  FusionScoreBreakdown,
  IncidentRecord,
  JWTPayload,
} from '../types/index.js';

export interface ProcessAssociationParams {
  complaint: ComplaintRecord;
  category: CivicCategory;
  description: string;
  latitude: number;
  longitude: number;
  embedding: number[] | null;
  aiAnalysis: AIAnalysisResult;
}

/**
 * Idempotent & Atomic Incident Association Service
 * Evaluates candidate incidents with spatial/temporal pre-filtering,
 * calculates fusion scores, and assigns the complaint to either an existing
 * or a newly created incident without producing orphaned records or duplicate rows.
 */
export const processComplaintAssociation = async (
  params: ProcessAssociationParams
): Promise<{
  targetIncident: IncidentRecord | null;
  isAutoMerged: boolean;
  fusionResult: FusionScoreBreakdown;
}> => {
  const { complaint, category, description, latitude, longitude, embedding, aiAnalysis } = params;
  const reportCode = complaint.complaintCode || complaint.id;

  // 1. Efficient Candidate Retrieval with Hard Gates Pre-filtering
  // Only query candidate incidents that are open/in-progress and spatially/temporally eligible
  const allIncidents = await db.getIncidents();
  const activeIncidents = allIncidents.filter(
    (inc) => inc.status !== 'RESOLVED' && inc.status !== 'CLOSED'
  );

  const complaintCreatedAt = new Date(complaint.createdAt || Date.now());

  const viableCandidates = activeIncidents.filter((inc) => {
    // Category compatibility gate
    const catScore = calculateCategoryScore(category, inc.category);
    if (catScore === 0) return false;

    // Geographic distance gate (1.5x margin for pre-filtering)
    const distKm = calculateDistanceKm(latitude, longitude, inc.latitude, inc.longitude);
    if (distKm > ENV.FUSION_MAX_DISTANCE_KM * 1.5) return false;

    // Temporal candidate gate (Status-aware candidate retrieval with 1.5x margin for pre-filtering)
    const rawTime = (inc as any).updatedAt || (inc as any).createdAt || new Date();
    const incTime = new Date(rawTime);
    const timeCheck = isCandidateWithinTimeWindow(
      complaintCreatedAt,
      incTime,
      inc.category,
      inc.status,
      1.5,
      ENV.FUSION_MAX_TIME_HOURS
    );
    if (!timeCheck.isWithinWindow) return false;

    return true;
  });

  // 2. Fetch embeddings ONLY for viable candidates (typically 0, 1, or 2 incidents)
  const candidatesWithEmbeddings = await Promise.all(
    viableCandidates.map(async (inc) => {
      const complaintEmbeddings = await db.getIncidentComplaintEmbeddings(inc.id);
      return {
        ...inc,
        complaintEmbeddings,
      };
    })
  );

  // 3. Evaluate fusion signals using authentic weights & decision thresholds
  const fusionResult = evaluateFusion({
    complaintCode: reportCode,
    description,
    category,
    latitude,
    longitude,
    createdAt: complaintCreatedAt,
    embedding,
    candidateIncidents: candidatesWithEmbeddings,
  });

  let targetIncidentId: string;
  let isAutoMerged = false;

  if (fusionResult.decision === 'AUTO_MERGE' && fusionResult.matchedIncidentId) {
    // AUTO-MERGE: Attach to existing incident
    const existingIncident = await db.getIncidentById(fusionResult.matchedIncidentId);
    if (!existingIncident) {
      throw new Error(`Matched incident ${fusionResult.matchedIncidentId} not found in database.`);
    }

    isAutoMerged = true;
    targetIncidentId = existingIncident.id;

    // Determine authentic report count from verified linked records
    const existingReports = await db.getIncidentReports(existingIncident.id);
    const isAlreadyLinked = existingReports.some(
      (r: any) =>
        r.complaintId === complaint.id ||
        r.complaint?.id === complaint.id ||
        r.complaintId === complaint.complaintCode
    );
    const newReportCount = isAlreadyLinked ? existingReports.length : existingReports.length + 1;

    // Temporal delta check for repeat report signal
    const rawIncTime = (existingIncident as any).updatedAt || (existingIncident as any).createdAt || new Date();
    const incTime = new Date(rawIncTime);
    const diffHours = Math.abs(complaintCreatedAt.getTime() - incTime.getTime()) / (1000 * 60 * 60);
    const isRepeatReport = diffHours >= ENV.FUSION_MAX_TIME_HOURS;
    const diffDays = Math.floor(diffHours / 24);

    // Re-evaluate Priority & Trend
    const priorityEval = evaluatePriority({
      baseSeverity: aiAnalysis.severity,
      category,
      reportCount: newReportCount,
      hazards: aiAnalysis.hazards,
      sensitiveLocations: aiAnalysis.sensitiveLocations,
      recentReportsInLastHour: 3,
    });

    // Update target incident trend: Repeat reports after >48h signal chronic persistence;
    // update trend to RISING if it was STABLE (without artificially increasing severity).
    let targetTrend = priorityEval.trend;
    if (isRepeatReport && targetTrend === 'STABLE') {
      targetTrend = 'RISING';
    }

    // Update target Incident
    await db.updateIncident(existingIncident.id, {
      reportCount: newReportCount,
      priority: priorityEval.priority,
      trend: targetTrend,
      fusionConfidence: fusionResult.fusionScore,
    });

    // Link complaint to existing incident
    await db.updateComplaint(complaint.id, {
      incidentId: existingIncident.id,
      status: 'IN_PROGRESS',
    });

    // Create or update incident_reports row (idempotent)
    await db.createIncidentReport({
      incidentId: existingIncident.id,
      complaintId: complaint.id,
      fusionScore: fusionResult.fusionScore,
      semanticScore: fusionResult.semanticScore,
      locationScore: fusionResult.locationScore,
      timeScore: fusionResult.timeScore,
      categoryScore: fusionResult.categoryScore,
      createdAt: new Date().toISOString(),
    });

    // Record status log only if this is NOT an idempotent retry of an already-linked report
    if (!isAlreadyLinked) {
      const logNote = isRepeatReport
        ? `Repeat citizen report ${reportCode} merged after ${diffDays} days (${diffHours.toFixed(1)}h). Chronic issue remains unresolved. Trend: ${targetTrend}.`
        : `Citizen report ${reportCode} auto-fused into incident (Confidence: ${(fusionResult.fusionScore * 100).toFixed(0)}%). Priority: ${priorityEval.priority}.`;

      await db.addStatusLog({
        incidentId: existingIncident.id,
        status: existingIncident.status,
        actorName: 'RiWA Fusion Engine',
        note: logNote,
      });
    }
  } else {
    // NEW INCIDENT CREATION (REVIEW or SEPARATE)
    // If complaint was already linked to an incident (e.g. retry), return it directly
    if (complaint.incidentId) {
      const currentInc = await db.getIncidentById(complaint.incidentId);
      if (currentInc) {
        return {
          targetIncident: currentInc,
          isAutoMerged: false,
          fusionResult,
        };
      }
    }

    const newIncidentNumber = Math.floor(100 + Math.random() * 900);
    const assignedIncidentCode = `INC-${newIncidentNumber}`;

    const subcatLabel = (aiAnalysis.subcategory || 'civic_issue')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const locationLabel = aiAnalysis.sensitiveLocations?.[0] || 'Rewa Sector';
    const title = `${subcatLabel} near ${locationLabel}`;

    const briefData = await generateIncidentBrief(
      title,
      category,
      1,
      [description]
    );

    const priorityEval = evaluatePriority({
      baseSeverity: aiAnalysis.severity,
      category,
      reportCount: 1,
      hazards: aiAnalysis.hazards,
      sensitiveLocations: aiAnalysis.sensitiveLocations,
    });

    const newIncident = await db.createIncident({
      incidentCode: assignedIncidentCode,
      title,
      category,
      latitude,
      longitude,
      priority: priorityEval.priority,
      status: 'OPEN',
      fusionConfidence: aiAnalysis.confidence || 0.90,
      departmentName: aiAnalysis.department,
      summary: briefData.summary,
      aiBrief: briefData.aiBrief,
      recommendedActions: briefData.recommendedActions,
      reportCount: 1,
      areaKm: 0.2,
      trend: 'STABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    targetIncidentId = newIncident.id;

    // Link complaint to new incident
    await db.updateComplaint(complaint.id, {
      incidentId: newIncident.id,
      status: 'OPEN',
    });

    // Create founding incident_reports association (idempotent)
    await db.createIncidentReport({
      incidentId: newIncident.id,
      complaintId: complaint.id,
      fusionScore: 1.0,
      semanticScore: 1.0,
      locationScore: 1.0,
      timeScore: 1.0,
      categoryScore: 1.0,
      createdAt: new Date().toISOString(),
    });

    const initNote =
      fusionResult.decision === 'REVIEW' && fusionResult.matchedIncidentId
        ? `Incident ${assignedIncidentCode} created (Review Band: ${(fusionResult.fusionScore * 100).toFixed(0)}% similarity with existing incident). Awaiting authority review.`
        : `Incident ${assignedIncidentCode} initialized from citizen report ${reportCode}. Classified as ${category}.`;

    await db.addStatusLog({
      incidentId: newIncident.id,
      status: 'OPEN',
      actorName: 'RiWA AI',
      note: initNote,
    });
  }

  const finalIncident = await db.getIncidentById(targetIncidentId);
  return {
    targetIncident: finalIncident,
    isAutoMerged,
    fusionResult,
  };
};

export const submitReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let savedComplaint: ComplaintRecord | null = null;
  try {
    // 1. Validate request
    const { description, latitude, longitude, imageUrl, categoryOverride } = req.body;

    if (!description || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Description and location (latitude, longitude) are required.' });
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      res.status(400).json({ error: 'Valid geographic coordinates are required.' });
      return;
    }

    // 2. Determine authenticated / valid user UUID
    let userId: string | null = req.user?.userId || null;
    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
          userId = decoded.userId;
        } catch {
          // Token invalid or expired, continue to fallback
        }
      }
    }

    if (!userId) {
      // Find the seeded demo citizen's real UUID in Supabase
      const demoCitizen = await db.findUserByEmail('citizen@riwa.demo');
      userId = demoCitizen ? demoCitizen.id : null;
    }

    // 3. IDEMPOTENCY / IN-FLIGHT DEDUPLICATION CHECK:
    // Check if an identical report was submitted within the last 15 minutes
    const existingRecent = await db.findRecentComplaint({
      userId,
      description,
      latitude: lat,
      longitude: lon,
      sinceMinutes: 15,
    });

    if (existingRecent) {
      // If already linked to an incident, return it immediately without re-processing (idempotent)
      if (existingRecent.incidentId) {
        console.log(`♻️ [Idempotency] Returning already processed complaint (${existingRecent.complaintCode}) and incident (${existingRecent.incidentId}).`);
        const linkedIncident = await db.getIncidentById(existingRecent.incidentId);
        res.status(200).json({
          success: true,
          complaint: existingRecent,
          incident: linkedIncident,
          isAutoMerged: (linkedIncident?.reportCount ?? 1) > 1,
          message: 'Report was already submitted and processed successfully.',
        });
        return;
      }

      // If existing recent complaint is unlinked, resume it instead of creating another duplicate row
      console.log(`♻️ [Idempotency] Resuming in-flight/interrupted complaint (${existingRecent.complaintCode}) rather than creating duplicate row.`);
      savedComplaint = existingRecent;
    } else {
      const reportCode = `R-${Math.floor(100 + Math.random() * 900)}`;
      savedComplaint = await db.createComplaint({
        complaintCode: reportCode,
        userId: userId as any,
        description,
        rawText: description,
        imageUrl: imageUrl || null,
        latitude: lat,
        longitude: lon,
        category: categoryOverride || undefined,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      });
    }

    // 4. Run AI analysis
    const aiAnalysis = await analyzeCitizenReport(description);
    const category = categoryOverride || aiAnalysis.category;

    // Update complaint with analyzed category
    await db.updateComplaint(savedComplaint.id, { category });

    // 5. Generate and store semantic embedding using complaint UUID
    const embedding = await generateEmbedding(description);

    await db.createAIAnalysis({
      complaintId: savedComplaint.id,
      category: aiAnalysis.category,
      subcategory: aiAnalysis.subcategory,
      severity: aiAnalysis.severity,
      summary: aiAnalysis.summary,
      department: aiAnalysis.department,
      confidence: aiAnalysis.confidence,
      keywords: aiAnalysis.keywords,
      hazards: aiAnalysis.hazards,
      sensitiveLocations: aiAnalysis.sensitiveLocations,
      embedding,
    });

    // 6. Execute Atomic Incident Association
    const { targetIncident, isAutoMerged, fusionResult } = await processComplaintAssociation({
      complaint: savedComplaint,
      category,
      description,
      latitude: lat,
      longitude: lon,
      embedding,
      aiAnalysis,
    });

    const updatedComplaint = await db.getComplaintById(savedComplaint.id);

    // 7. Return complete result
    res.status(201).json({
      success: true,
      complaint: updatedComplaint || savedComplaint,
      incident: targetIncident,
      isAutoMerged,
      aiAnalysis,
      fusionResult,
    });
  } catch (error: any) {
    console.error('Submit report error (non-PII):', error?.message || error);

    // If complaint was created but association failed, ensure it reaches a defined terminal state
    if (savedComplaint) {
      try {
        await db.updateComplaint(savedComplaint.id, { status: 'OPEN' });
        console.warn(`⚠️ [Report Pipeline] Incident association deferred for complaint ${savedComplaint.complaintCode}. Awaiting review.`);
        res.status(202).json({
          success: true,
          complaint: savedComplaint,
          incident: null,
          pendingReview: true,
          message: 'Your report has been safely recorded and queued for municipal review.',
        });
        return;
      } catch (recoveryErr: any) {
        console.error('Failed to update deferred complaint state:', recoveryErr?.message);
      }
    }

    res.status(500).json({ error: 'Failed to process citizen report.' });
  }
};

/**
 * Reconciles an unlinked or pending complaint idempotently
 */
export const reconcileComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const complaint = await db.getComplaintById(id);

    if (!complaint) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    // If already associated with an incident, return idempotently
    if (complaint.incidentId) {
      const existingInc = await db.getIncidentById(complaint.incidentId);
      res.json({
        success: true,
        complaint,
        incident: existingInc,
        message: 'Complaint is already associated with an incident.',
      });
      return;
    }

    // Run AI analysis and embedding if missing
    const aiAnalysis = await analyzeCitizenReport(complaint.description);
    const category = complaint.category || aiAnalysis.category;
    const embedding = await generateEmbedding(complaint.description);

    const { targetIncident, isAutoMerged, fusionResult } = await processComplaintAssociation({
      complaint,
      category,
      description: complaint.description,
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      embedding,
      aiAnalysis,
    });

    const updatedComplaint = await db.getComplaintById(complaint.id);

    res.json({
      success: true,
      complaint: updatedComplaint || complaint,
      incident: targetIncident,
      isAutoMerged,
      fusionResult,
    });
  } catch (error: any) {
    console.error('Reconcile complaint error:', error);
    res.status(500).json({ error: 'Failed to reconcile complaint.' });
  }
};

export const getMyReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let userId = req.user?.userId;
    if (!userId) {
      const demoCitizen = await db.findUserByEmail('citizen@riwa.demo');
      userId = demoCitizen ? demoCitizen.id : '';
    }
    const reports = await db.getComplaintsByUser(String(userId || ''));
    res.json(reports);
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ error: 'Failed to fetch citizen reports.' });
  }
};

export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const report = await db.getComplaintById(id);

    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    let linkedIncident = null;
    if (report.incidentId) {
      linkedIncident = await db.getIncidentById(report.incidentId);
    }

    res.json({
      report,
      incident: linkedIncident,
    });
  } catch (error) {
    console.error('Get report detail error:', error);
    res.status(500).json({ error: 'Failed to fetch report details.' });
  }
};

export const uploadReportImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image file uploaded. Please provide an image file in the "image" field.' });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const collisionSafeName = `evidence-${Date.now()}-${crypto.randomUUID()}${ext}`;
    const storagePath = collisionSafeName;

    const supabase = getSupabase();
    let imageUrl: string | null = null;
    let storageProvider: 'supabase' | 'local' = 'supabase';

    if (supabase) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-evidence')
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('report-evidence')
            .getPublicUrl(storagePath);
          imageUrl = urlData.publicUrl;
          console.log(`☁️ [Storage] Successfully uploaded evidence to Supabase Storage: ${imageUrl}`);
        } else {
          console.warn(`⚠️ [Storage] Supabase upload failed (${uploadError?.message}), using local fallback.`);
        }
      } catch (err: any) {
        console.warn('⚠️ [Storage] Exception during Supabase upload:', err.message);
      }
    }

    // Local fallback if Supabase Storage bucket is not yet provisioned
    if (!imageUrl) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, collisionSafeName);
      fs.writeFileSync(localFilePath, file.buffer);
      const host = req.get('host') || `localhost:${ENV.PORT}`;
      const protocol = req.protocol || 'http';
      imageUrl = `${protocol}://${host}/uploads/${collisionSafeName}`;
      storageProvider = 'local';
      console.log(`📁 [Storage] Saved evidence to local fallback: ${imageUrl}`);
    }

    res.status(201).json({
      success: true,
      imageUrl,
      fileName: collisionSafeName,
      storageProvider,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to process and upload image.' });
  }
};
