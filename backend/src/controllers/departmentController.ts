import { Request, Response } from 'express';
import { db } from '../db/store.js';

export const getDepartments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const departments = await db.getDepartments();
    const incidents = await db.getIncidents();

    const result = (departments || []).map((dept: any) => {
      const normDeptName = (dept.name || '').toLowerCase().replace(/[\s_-]+/g, '');
      const normDeptCode = (dept.code || '').toLowerCase().replace(/[\s_-]+/g, '');
      const deptIncidents = incidents.filter((i) => {
        if (i.departmentId === dept.id) return true;
        const iDept = (i.departmentName || '').toLowerCase().trim();
        const normIDept = iDept.replace(/[\s_-]+/g, '');
        return iDept === (dept.name || '').toLowerCase().trim() ||
               normIDept === normDeptName ||
               (normDeptCode && normIDept === normDeptCode);
      });
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
