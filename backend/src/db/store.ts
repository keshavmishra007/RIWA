import bcrypt from 'bcryptjs';
import { getSupabase } from '../config/supabase.js';
import {
  CivicCategory,
  ComplaintRecord,
  IncidentPriority,
  IncidentRecord,
  IncidentReportRecord,
  IncidentStatus,
  IncidentTrend,
  User,
  UserRole,
} from '../types/index.js';

// Pre-seeded Demo Data for Rewa (matches frontend mockData)
export interface InMemoryStore {
  users: Array<User & { passwordHash: string }>;
  departments: Array<{ id: string; name: string; code: string; description: string }>;
  incidents: IncidentRecord[];
  complaints: ComplaintRecord[];
  incidentReports: IncidentReportRecord[];
  statusLogs: Array<{
    id: string;
    incidentId: string;
    status: IncidentStatus;
    actorId?: string;
    actorName: string;
    note: string;
    timestamp: string;
  }>;
  hotspots: Array<{
    id: string;
    code: string;
    label: string;
    category: CivicCategory;
    severity: IncidentPriority;
    latitude: number;
    longitude: number;
    radius: number;
    reportCount: number;
    incidentCount: number;
    trend: IncidentTrend;
  }>;
}

// Initial in-memory state
const initialPasswordHash = bcrypt.hashSync('demo123', 10);

const memoryStore: InMemoryStore = {
  users: [
    {
      id: 'u-citizen-01',
      name: 'Rahul Sharma',
      email: 'citizen@riwa.demo',
      passwordHash: initialPasswordHash,
      role: 'CITIZEN',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u-auth-01',
      name: 'Dr. Priya Verma',
      email: 'authority@riwa.demo',
      passwordHash: initialPasswordHash,
      role: 'AUTHORITY',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u-admin-01',
      name: 'Admin User',
      email: 'admin@riwa.demo',
      passwordHash: initialPasswordHash,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
  ],
  departments: [
    { id: 'dept-01', name: 'Municipal Engineering', code: 'municipal_engineering', description: 'Handles water drainage, sewers, and municipal construction' },
    { id: 'dept-02', name: 'Sanitation', code: 'sanitation', description: 'Solid waste management and cleanliness' },
    { id: 'dept-03', name: 'Public Works', code: 'public_works', description: 'Roads, bridges, and public pathways' },
    { id: 'dept-04', name: 'Electrical', code: 'electrical', description: 'Street lighting and public electrical lines' },
    { id: 'dept-05', name: 'Other Civic Services', code: 'other_civic_services', description: 'General civic issues, traffic, hospital cleanliness, and stray animals' },
  ],
  incidents: [],
  complaints: [],
  incidentReports: [],
  statusLogs: [],
  hotspots: [],
};

// Data Access Layer
export const db = {
  // Users
  findUserByEmail: async (email: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const cleanEmail = email.trim();
      const { data, error } = await supabase.from('users').select('*').ilike('email', cleanEmail).single();
      if (error && error.code !== 'PGRST116') console.error('Supabase findUser error:', error);
      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          passwordHash: data.password_hash,
          role: data.role as UserRole,
          createdAt: data.created_at,
        };
      }
      return null;
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserById: async (id: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase.from('users').select('*').eq('id', id).single();
      if (data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          createdAt: data.created_at,
        };
      }
      return null;
    }
    const found = memoryStore.users.find((u) => u.id === id);
    if (!found) return null;
    const { passwordHash: _, ...rest } = found;
    return rest;
  },

  createUser: async (user: { name: string; email: string; passwordHash: string; role: UserRole }) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          password_hash: user.passwordHash,
          role: user.role,
        })
        .select()
        .single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as UserRole,
        createdAt: data.created_at,
      };
    }
    const newUser = {
      id: `u-${Date.now()}`,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: new Date().toISOString(),
    };
    memoryStore.users.push(newUser);
    const { passwordHash: _, ...rest } = newUser;
    return rest;
  },

  // Incidents
  getIncidents: async (): Promise<IncidentRecord[]> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('incidents')
        .select('*, departments(name)')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase getIncidents error:', error);
        return memoryStore.incidents;
      }
      return data.map((d: any) => ({
        id: d.id,
        incidentCode: d.incident_code,
        title: d.title,
        category: d.category,
        latitude: d.latitude,
        longitude: d.longitude,
        priority: d.priority,
        status: d.status,
        fusionConfidence: d.fusion_confidence,
        departmentId: d.department_id,
        departmentName: d.departments?.name || 'Unassigned',
        summary: d.summary,
        aiBrief: d.ai_brief,
        recommendedActions: Array.isArray(d.recommended_actions) ? d.recommended_actions : [],
        reportCount: d.report_count,
        areaKm: d.area_km,
        trend: d.trend,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
    return memoryStore.incidents;
  },

  getIncidentById: async (id: string): Promise<IncidentRecord | null> => {
    const supabase = getSupabase();
    if (supabase) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('incidents').select('*, departments(name)');
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('incident_code', id);
      }
      const { data, error } = await query.single();
      if (error || !data) return null;
      return {
        id: data.id,
        incidentCode: data.incident_code,
        title: data.title,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        priority: data.priority,
        status: data.status,
        fusionConfidence: data.fusion_confidence,
        departmentId: data.department_id,
        departmentName: data.departments?.name || 'Unassigned',
        summary: data.summary,
        aiBrief: data.ai_brief,
        recommendedActions: Array.isArray(data.recommended_actions) ? data.recommended_actions : [],
        reportCount: data.report_count,
        areaKm: data.area_km,
        trend: data.trend,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
    return (
      memoryStore.incidents.find((inc) => inc.id === id || inc.incidentCode.toLowerCase() === id.toLowerCase()) ||
      null
    );
  },

  createIncident: async (incident: Omit<IncidentRecord, 'id'>): Promise<IncidentRecord> => {
    const supabase = getSupabase();
    if (supabase) {
      let deptId = incident.departmentId || null;
      if (!deptId && incident.departmentName) {
        const { data: dept } = await supabase
          .from('departments')
          .select('id')
          .ilike('name', incident.departmentName)
          .single();
        if (dept) deptId = dept.id;
      }

      const insertPayload: any = {
        incident_code: incident.incidentCode,
        title: incident.title,
        category: incident.category,
        latitude: incident.latitude,
        longitude: incident.longitude,
        priority: incident.priority,
        status: incident.status,
        fusion_confidence: incident.fusionConfidence,
        department_id: deptId,
        summary: incident.summary,
        ai_brief: incident.aiBrief,
        recommended_actions: incident.recommendedActions,
        report_count: incident.reportCount,
        area_km: incident.areaKm,
        trend: incident.trend,
      };

      let { data, error } = await supabase.from('incidents').insert(insertPayload).select().single();
      if (error && error.code === '23514') {
        // Fallback for check constraint if 'other' category migration is pending
        insertPayload.category = 'drainage';
        const retry = await supabase.from('incidents').insert(insertPayload).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
      if (error) throw error;
      return {
        ...incident,
        id: data.id,
      };
    }
    const newInc: IncidentRecord = {
      ...incident,
      id: `inc-${Date.now()}`,
    };
    memoryStore.incidents.unshift(newInc);
    return newInc;
  },

  updateIncident: async (id: string, updates: Partial<IncidentRecord>): Promise<IncidentRecord | null> => {
    const supabase = getSupabase();
    if (supabase) {
      const mappedUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.status) mappedUpdates.status = updates.status;
      if (updates.priority) mappedUpdates.priority = updates.priority;
      if (updates.reportCount !== undefined) mappedUpdates.report_count = updates.reportCount;
      if (updates.fusionConfidence !== undefined) mappedUpdates.fusion_confidence = updates.fusionConfidence;
      if (updates.departmentId) mappedUpdates.department_id = updates.departmentId;
      if (updates.trend) mappedUpdates.trend = updates.trend;
      if (updates.summary) mappedUpdates.summary = updates.summary;
      if (updates.aiBrief) mappedUpdates.ai_brief = updates.aiBrief;
      if (updates.recommendedActions) mappedUpdates.recommended_actions = updates.recommendedActions;

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('incidents').update(mappedUpdates);
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('incident_code', id);
      }
      const { data, error } = await query.select().single();
      if (error || !data) return null;
      return {
        id: data.id,
        incidentCode: data.incident_code,
        title: data.title,
        category: data.category,
        latitude: data.latitude,
        longitude: data.longitude,
        priority: data.priority,
        status: data.status,
        fusionConfidence: data.fusion_confidence,
        departmentId: data.department_id,
        summary: data.summary,
        aiBrief: data.ai_brief,
        recommendedActions: data.recommended_actions,
        reportCount: data.report_count,
        areaKm: data.area_km,
        trend: data.trend,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
    const idx = memoryStore.incidents.findIndex((i) => i.id === id || i.incidentCode === id);
    if (idx === -1) return null;
    memoryStore.incidents[idx] = {
      ...memoryStore.incidents[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return memoryStore.incidents[idx];
  },

  // Complaints (Citizen Reports)
  getAllComplaints: async (): Promise<ComplaintRecord[]> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        complaintCode: d.complaint_code,
        userId: d.user_id,
        description: d.description,
        rawText: d.raw_text,
        imageUrl: d.image_url,
        latitude: d.latitude,
        longitude: d.longitude,
        category: d.category || 'other',
        status: d.status,
        incidentId: d.incident_id,
        createdAt: d.created_at,
      }));
    }
    return memoryStore.complaints;
  },

  createComplaint: async (complaint: Omit<ComplaintRecord, 'id'>): Promise<ComplaintRecord> => {
    const supabase = getSupabase();
    if (supabase) {
      const insertPayload: any = {
        complaint_code: complaint.complaintCode,
        user_id: complaint.userId,
        description: complaint.description,
        raw_text: complaint.rawText || complaint.description,
        image_url: complaint.imageUrl || null,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        category: complaint.category || null,
        status: complaint.status,
        incident_id: complaint.incidentId || null,
      };

      let { data, error } = await supabase.from('complaints').insert(insertPayload).select().single();
      if (error && error.code === '23514') {
        // Fallback if 'other' check constraint is pending: category column allows NULL in schema
        insertPayload.category = null;
        const retry = await supabase.from('complaints').insert(insertPayload).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
      if (error) throw error;
      return {
        ...complaint,
        id: data.id,
      };
    }
    const newComp: ComplaintRecord = {
      ...complaint,
      id: `r-${Date.now()}`,
    };
    memoryStore.complaints.unshift(newComp);
    return newComp;
  },

  getComplaintsByUser: async (userId: string): Promise<ComplaintRecord[]> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) return [];
      return data.map((d: any) => ({
        id: d.id,
        complaintCode: d.complaint_code,
        userId: d.user_id,
        description: d.description,
        rawText: d.raw_text,
        imageUrl: d.image_url,
        latitude: d.latitude,
        longitude: d.longitude,
        category: d.category,
        status: d.status,
        incidentId: d.incident_id,
        createdAt: d.created_at,
      }));
    }
    return memoryStore.complaints.filter((c) => c.userId === userId);
  },

  getComplaintById: async (id: string): Promise<ComplaintRecord | null> => {
    const supabase = getSupabase();
    if (supabase) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let query = supabase.from('complaints').select('*');
      if (isUUID) {
        query = query.eq('id', id);
      } else {
        query = query.eq('complaint_code', id);
      }
      const { data, error } = await query.single();
      if (error || !data) return null;
      return {
        id: data.id,
        complaintCode: data.complaint_code,
        userId: data.user_id,
        description: data.description,
        rawText: data.raw_text,
        imageUrl: data.image_url,
        latitude: data.latitude,
        longitude: data.longitude,
        category: data.category,
        status: data.status,
        incidentId: data.incident_id,
        createdAt: data.created_at,
      };
    }
    return (
      memoryStore.complaints.find((c) => c.id === id || c.complaintCode.toLowerCase() === id.toLowerCase()) ||
      null
    );
  },

  getComplaintsByIncident: async (incidentId: string): Promise<ComplaintRecord[]> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('incident_id', incidentId);
      if (error) return [];
      return data.map((d: any) => ({
        id: d.id,
        complaintCode: d.complaint_code,
        userId: d.user_id,
        description: d.description,
        rawText: d.raw_text,
        imageUrl: d.image_url,
        latitude: d.latitude,
        longitude: d.longitude,
        category: d.category,
        status: d.status,
        incidentId: d.incident_id,
        createdAt: d.created_at,
      }));
    }
    return memoryStore.complaints.filter((c) => c.incidentId === incidentId);
  },

  updateComplaint: async (id: string, updates: Partial<ComplaintRecord>) => {
    const supabase = getSupabase();
    if (supabase) {
      const mappedUpdates: any = {};
      if (updates.incidentId !== undefined) mappedUpdates.incident_id = updates.incidentId;
      if (updates.status !== undefined) mappedUpdates.status = updates.status;
      if (updates.category !== undefined) mappedUpdates.category = updates.category;

      const { error } = await supabase.from('complaints').update(mappedUpdates).eq('id', id);
      if (error) console.error('Error updating complaint in Supabase:', error);
      return;
    }
    const idx = memoryStore.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      memoryStore.complaints[idx] = { ...memoryStore.complaints[idx], ...updates };
    }
  },

  // AI Analyses Storage
  createAIAnalysis: async (analysis: {
    complaintId: string;
    category: string;
    subcategory?: string;
    severity: string;
    summary: string;
    department?: string;
    confidence: number;
    keywords?: string[];
    hazards?: string[];
    sensitiveLocations?: string[];
    embedding?: number[] | null;
  }) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('ai_analyses').insert({
        complaint_id: analysis.complaintId,
        category: analysis.category,
        subcategory: analysis.subcategory,
        severity: analysis.severity,
        summary: analysis.summary,
        department: analysis.department,
        confidence: analysis.confidence,
        keywords: analysis.keywords || [],
        hazards: analysis.hazards || [],
        sensitive_locations: analysis.sensitiveLocations || [],
        embedding: analysis.embedding || null,
      });
      if (error) {
        console.error('Error inserting ai_analysis to Supabase:', error);
      }
      return;
    }
  },

  // Incident Semantic Embeddings Retrieval (derives from associated complaints)
  getIncidentComplaintEmbeddings: async (incidentId: string): Promise<number[][]> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: compData } = await supabase
        .from('complaints')
        .select('id')
        .eq('incident_id', incidentId);
      if (compData && compData.length > 0) {
        const compIds = compData.map((c: any) => c.id);
        const { data: aiData } = await supabase
          .from('ai_analyses')
          .select('embedding')
          .in('complaint_id', compIds)
          .not('embedding', 'is', null);
        if (aiData) {
          return aiData
            .map((a: any) => a.embedding)
            .filter((e: any) => Array.isArray(e) && e.length > 0);
        }
      }
      return [];
    }
    return [];
  },

  // Incident Reports & Fusion Relations
  createIncidentReport: async (report: Omit<IncidentReportRecord, 'id'>) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('incident_reports').insert({
        incident_id: report.incidentId,
        complaint_id: report.complaintId,
        fusion_score: report.fusionScore,
        semantic_score: report.semanticScore,
        location_score: report.locationScore,
        time_score: report.timeScore,
        category_score: report.categoryScore,
      });
      if (error) {
        console.error('Error creating incident_report in Supabase:', error);
      }
      return;
    }
    memoryStore.incidentReports.push({
      ...report,
      id: `ir-${Date.now()}`,
    });
  },

  getIncidentReports: async (incidentId: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*, complaints(*)')
        .eq('incident_id', incidentId);
      if (error || !data) return [];
      
      // Explicit normalization: map database snake_case to frontend camelCase
      return data.map((d: any) => ({
        id: d.id,
        incidentId: d.incident_id,
        complaintId: d.complaints?.complaint_code || d.complaint_id,
        fusionScore: Math.round((d.fusion_score || 0) * 100),
        semanticScore: d.semantic_score,
        locationScore: d.location_score,
        timeScore: d.time_score,
        categoryScore: d.category_score,
        createdAt: d.created_at,
        complaint: d.complaints
          ? {
              id: d.complaints.id,
              complaintCode: d.complaints.complaint_code,
              userId: d.complaints.user_id,
              description: d.complaints.description,
              rawText: d.complaints.raw_text,
              imageUrl: d.complaints.image_url,
              latitude: d.complaints.latitude,
              longitude: d.complaints.longitude,
              category: d.complaints.category,
              status: d.complaints.status,
              createdAt: d.complaints.created_at,
            }
          : {
              id: d.complaint_id,
              complaintCode: d.complaint_id,
              description: 'Citizen report',
              createdAt: d.created_at,
            },
      }));
    }
    return memoryStore.incidentReports
      .filter((ir) => ir.incidentId === incidentId)
      .map((ir) => ({
        ...ir,
        complaint: memoryStore.complaints.find((c) => c.id === ir.complaintId),
      }));
  },

  // Status Logs
  addStatusLog: async (log: { incidentId: string; status: IncidentStatus; actorId?: string; actorName: string; note: string }) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('status_logs').insert({
        incident_id: log.incidentId,
        status: log.status,
        actor_id: log.actorId || null,
        actor_name: log.actorName,
        note: log.note,
      });
      if (error) {
        console.error('Error adding status_log in Supabase:', error);
      }
      return;
    }
    memoryStore.statusLogs.unshift({
      id: `sl-${Date.now()}`,
      incidentId: log.incidentId,
      status: log.status,
      actorId: log.actorId,
      actorName: log.actorName,
      note: log.note,
      timestamp: new Date().toISOString(),
    });
  },

  getStatusLogs: async (incidentId: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('status_logs')
        .select('*')
        .eq('incident_id', incidentId)
        .order('timestamp', { ascending: false });
      if (error || !data) return [];

      // Explicit normalization: map database snake_case to frontend camelCase
      return data.map((d: any) => ({
        id: d.id,
        incidentId: d.incident_id,
        status: d.status,
        actorId: d.actor_id,
        actorName: d.actor_name,
        note: d.note,
        timestamp: d.timestamp,
      }));
    }
    return memoryStore.statusLogs.filter((sl) => sl.incidentId === incidentId);
  },

  // Hotspots
  getHotspots: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase.from('hotspots').select('*');
      if (data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          code: d.hotspot_code || `HS-${d.id.substring(0, 4)}`,
          label: d.label,
          category: d.category,
          severity: d.severity,
          latitude: d.latitude,
          longitude: d.longitude,
          radius: d.radius || 400,
          reportCount: d.report_count || 1,
          incidentCount: d.incident_count || 1,
          trend: d.trend || 'STABLE',
          incidentId: d.incident_id,
        }));
      }

      // Compute dynamic hotspot circles directly from real active incidents
      const incidents = await db.getIncidents();
      const active = incidents.filter(
        (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && (i.reportCount || 0) > 0
      );
      return active.map((inc) => ({
        id: `hs-${inc.id}`,
        code: `HS-${inc.incidentCode}`,
        label: `${inc.title} Zone`,
        category: inc.category,
        severity: inc.priority,
        latitude: inc.latitude,
        longitude: inc.longitude,
        radius: Math.max(300, Math.round((inc.areaKm || 0.4) * 1000)),
        reportCount: inc.reportCount,
        incidentCount: 1,
        trend: inc.trend,
        incidentId: inc.id,
      }));
    }
    return [];
  },

  // Departments
  getDepartments: async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data } = await supabase.from('departments').select('*');
      if (data && data.length > 0) return data;
    }
    return memoryStore.departments;
  },
};
