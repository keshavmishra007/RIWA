import { Request, Response } from 'express';
import { db } from '../db/store.js';

export const getAnalyticsOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const incidents = await db.getIncidents();
    const hotspots = await db.getHotspots();
    const complaints = await db.getAllComplaints();
    const departments = await db.getDepartments();

    const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED');
    const criticalIncidents = activeIncidents.filter((i) => i.priority === 'CRITICAL');

    // Count reports created today (local date matching)
    const todayStr = new Date().toDateString();
    const reportsTodayCount = complaints.filter((c) => {
      try {
        return new Date(c.createdAt).toDateString() === todayStr;
      } catch {
        return false;
      }
    }).length;

    // Category distribution from real complaints
    const categoryCounts: Record<string, number> = {
      drainage: 0,
      garbage: 0,
      road_damage: 0,
      electrical_hazard: 0,
      other: 0,
    };
    for (const c of complaints) {
      const cat = c.category && categoryCounts[c.category] !== undefined ? c.category : 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const totalC = complaints.length > 0 ? complaints.length : 1;
    const categoryDistribution = [
      { category: 'Drainage', count: categoryCounts['drainage'], percentage: Math.round((categoryCounts['drainage'] / totalC) * 100) },
      { category: 'Garbage', count: categoryCounts['garbage'], percentage: Math.round((categoryCounts['garbage'] / totalC) * 100) },
      { category: 'Road Damage', count: categoryCounts['road_damage'], percentage: Math.round((categoryCounts['road_damage'] / totalC) * 100) },
      { category: 'Electrical', count: categoryCounts['electrical_hazard'], percentage: Math.round((categoryCounts['electrical_hazard'] / totalC) * 100) },
      { category: 'Other Civic Services', count: categoryCounts['other'], percentage: Math.round((categoryCounts['other'] / totalC) * 100) },
    ];

    // Priority distribution from real active incidents
    const priorityCounts: Record<string, number> = {
      Critical: criticalIncidents.length,
      High: activeIncidents.filter((i) => i.priority === 'HIGH').length,
      Medium: activeIncidents.filter((i) => i.priority === 'MEDIUM').length,
      Low: activeIncidents.filter((i) => i.priority === 'LOW').length,
    };

    const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
    }));

    // Department workload dynamically calculated from real incidents
    const departmentWorkload = (departments || []).map((dept: any) => {
      const deptIncidents = incidents.filter(
        (i) => i.departmentId === dept.id || i.departmentName === dept.name
      );
      const active = deptIncidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
      const resolved = deptIncidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        department: dept.name,
        active,
        resolved,
        critical: deptIncidents.filter((i) => i.priority === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length,
        pending: deptIncidents.filter((i) => i.status === 'OPEN' || i.status === 'ASSIGNED').length,
      };
    });

    res.json({
      totalReports: complaints.length,
      totalIncidents: incidents.length,
      activeIncidents: activeIncidents.length,
      criticalIncidents: criticalIncidents.length,
      emergingHotspots: hotspots.length,
      reportsToday: reportsTodayCount,
      avgResponseTime: activeIncidents.length > 0 ? 'Under review' : 'No active queue',
      avgResolutionTime: 'Active monitoring',
      categoryDistribution,
      priorityDistribution,
      dailyTrends: [],
      departmentWorkload,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to compute analytics overview.' });
  }
};
