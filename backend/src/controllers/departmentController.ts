import { Request, Response } from 'express';
import { db } from '../db/store.js';

export const getDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const departments = await db.getDepartments();
    const incidents = await db.getIncidents();

    const result = (departments || []).map((dept: any) => {
      const deptIncidents = incidents.filter(
        (i) => i.departmentId === dept.id || i.departmentName === dept.name
      );
      const activeIncidents = deptIncidents.filter(
        (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
      ).length;
      const criticalIncidents = deptIncidents.filter(
        (i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED'
      ).length;
      const pendingIncidents = deptIncidents.filter(
        (i) => i.status === 'OPEN' || i.status === 'ASSIGNED'
      ).length;
      const resolvedIncidents = deptIncidents.filter(
        (i) => i.status === 'RESOLVED' || i.status === 'CLOSED'
      ).length;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        activeIncidents,
        criticalIncidents,
        pendingIncidents,
        resolvedIncidents,
        avgResponseTime: activeIncidents > 0 ? 'Under review' : 'No active queue',
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to retrieve departments.' });
  }
};
