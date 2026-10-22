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
    { id: 'dept-05', name: 'Animal Control', code: 'animal_control', description: 'Stray cows, cattle roaming, animals obstructing roads, and animal-related public safety' },
    { id: 'dept-06', name: 'Traffic Police', code: 'traffic_police', description: 'Traffic congestion, signal failures, dangerous road obstructions, and traffic enforcement' },
    { id: 'dept-07', name: 'Other Civic Services', code: 'other_civic_services', description: 'General civic issues, miscellaneous infrastructure, and complaints requiring human review' },
  ],
  incidents: [],
  complaints: [],
  incidentReports: [],
  statusLogs: [],
  hotspots: [],
};

// Department heuristic recommendation helper
export const deriveAiRecommendedDepartment = (incident: {
  category?: string;
  title?: string;
  summary?: string;
  aiBrief?: string;
}): { recommended: string; supporting?: string; needsHumanReview?: boolean } => {
  const text = `${incident.title || ''} ${incident.summary || ''} ${incident.aiBrief || ''}`.toLowerCase();
  
  if (
    text.includes('cow') ||
    text.includes('cattle') ||
    text.includes('gaay') ||
    text.includes('gaye') ||
    text.includes('saand') ||
    text.includes('bull') ||
    text.includes('bovine') ||
    text.includes('stray animal') ||
    text.includes('stray dog') ||
    text.includes('injured animal') ||
    text.includes('sick animal')
  ) {
    const isTrafficBlocking = text.includes('traffic') || text.includes('jam') || text.includes('road') || text.includes('sadak');
    return {
      recommended: 'Animal Control',
      supporting: isTrafficBlocking ? 'Traffic Police' : undefined,
    };
  }

  if (
    text.includes('traffic') ||
    text.includes('jam') ||
    text.includes('congestion') ||
    text.includes('signal') ||
    text.includes('parking') ||
    text.includes('gridlock') ||
    text.includes('chakka jam')
  ) {
    return { recommended: 'Traffic Police' };
  }

  if (incident.category === 'drainage') return { recommended: 'Municipal Engineering' };
  if (incident.category === 'garbage') return { recommended: 'Sanitation' };
  if (incident.category === 'road_damage') return { recommended: 'Public Works' };
  if (incident.category === 'electrical_hazard') return { recommended: 'Electrical' };

  return { recommended: 'Other Civic Services', needsHumanReview: true };
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
      return data.map((d: any) => {
        const aiDeptInfo = deriveAiRecommendedDepartment(d);
        return {
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
          aiRecommendedDepartment: aiDeptInfo.recommended,
          supportingDepartment: aiDeptInfo.supporting,
          needsHumanReview: aiDeptInfo.needsHumanReview,
          summary: d.summary,
          aiBrief: d.ai_brief,
          recommendedActions: Array.isArray(d.recommended_actions) ? d.recommended_actions : [],
          reportCount: d.report_count,
          areaKm: d.area_km,
          trend: d.trend,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        };
      });
    }
    return memoryStore.incidents.map((inc) => {
      const aiDeptInfo = deriveAiRecommendedDepartment(inc);
      return {
        ...inc,
        departmentName: inc.departmentName || 'Unassigned',
        aiRecommendedDepartment: inc.aiRecommendedDepartment || aiDeptInfo.recommended,
        supportingDepartment: inc.supportingDepartment || aiDeptInfo.supporting,
        needsHumanReview: inc.needsHumanReview || aiDeptInfo.needsHumanReview,
      };
    });
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
      const aiDeptInfo = deriveAiRecommendedDepartment(data);
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
        aiRecommendedDepartment: aiDeptInfo.recommended,
        supportingDepartment: aiDeptInfo.supporting,
        needsHumanReview: aiDeptInfo.needsHumanReview,
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
    const found = memoryStore.incidents.find((inc) => inc.id === id || inc.incidentCode.toLowerCase() === id.toLowerCase()) || null;
    if (!found) return null;
    const aiDeptInfo = deriveAiRecommendedDepartment(found);
    return {
      ...found,
      departmentName: found.departmentName || 'Unassigned',
      aiRecommendedDepartment: found.aiRecommendedDepartment || aiDeptInfo.recommended,
      supportingDepartment: found.supportingDepartment || aiDeptInfo.supporting,
      needsHumanReview: found.needsHumanReview || aiDeptInfo.needsHumanReview,
    };
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
      if (updates.departmentId !== undefined) {
        mappedUpdates.department_id = updates.departmentId;
      } else if (updates.departmentName) {
        if (updates.departmentName.toLowerCase() === 'unassigned') {
          mappedUpdates.department_id = null;
        } else {
          const { data: dept } = await supabase
            .from('departments')
            .select('id')
            .ilike('name', updates.departmentName)
            .maybeSingle();
          if (dept) mappedUpdates.department_id = dept.id;
        }
      }
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
      const { data, error } = await query.select('*, departments(name)').single();
      if (error || !data) return null;
      const aiDeptInfo = deriveAiRecommendedDepartment(data);
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
        aiRecommendedDepartment: aiDeptInfo.recommended,
        supportingDepartment: aiDeptInfo.supporting,
        needsHumanReview: aiDeptInfo.needsHumanReview,
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

  // Deduplication & In-Flight Recovery: find recent identical complaint within time window
  findRecentComplaint: async (params: {
    userId?: string | null;
    description: string;
    latitude: number;
    longitude: number;
    sinceMinutes?: number;
  }): Promise<ComplaintRecord | null> => {
    const supabase = getSupabase();
    const minutes = params.sinceMinutes || 15;
    const sinceTime = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    const cleanDesc = params.description.trim().toLowerCase();

    if (supabase) {
      let query = supabase
        .from('complaints')
        .select('*')
        .gte('created_at', sinceTime);

      if (params.userId) {
        query = query.eq('user_id', params.userId);
      }

      const { data, error } = await query;
      if (error || !data) return null;

      // Find match with exact description and proximity (~150 meters)
      const match = data.find((c: any) => {
        const descMatch = (c.description || '').trim().toLowerCase() === cleanDesc;
        const latDiff = Math.abs(Number(c.latitude) - params.latitude);
        const lonDiff = Math.abs(Number(c.longitude) - params.longitude);
        const geoMatch = latDiff < 0.002 && lonDiff < 0.002;
        return descMatch && geoMatch;
      });

      if (match) {
        return {
          id: match.id,
          complaintCode: match.complaint_code,
          userId: match.user_id,
          description: match.description,
          rawText: match.raw_text,
          imageUrl: match.image_url,
          latitude: Number(match.latitude),
          longitude: Number(match.longitude),
          category: match.category,
          status: match.status,
          incidentId: match.incident_id,
          createdAt: match.created_at,
        };
      }
      return null;
    }

    const match = memoryStore.complaints.find((c) => {
      const isRecent = new Date(c.createdAt).getTime() >= Date.now() - minutes * 60 * 1000;
      const descMatch = (c.description || '').trim().toLowerCase() === cleanDesc;
      const userMatch = !params.userId || c.userId === params.userId;
      const latDiff = Math.abs(c.latitude - params.latitude);
      const lonDiff = Math.abs(c.longitude - params.longitude);
      return isRecent && descMatch && userMatch && latDiff < 0.002 && lonDiff < 0.002;
    });

    return match || null;
  },

  // Retrieve unlinked complaints for recovery / health checks
  getUnlinkedComplaints: async (): Promise<ComplaintRecord[]> => {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .is('incident_id', null)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((d: any) => ({
        id: d.id,
        complaintCode: d.complaint_code,
        userId: d.user_id,
        description: d.description,
        rawText: d.raw_text,
        imageUrl: d.image_url,
        latitude: Number(d.latitude),
        longitude: Number(d.longitude),
        category: d.category,
        status: d.status,
        incidentId: d.incident_id,
        createdAt: d.created_at,
      }));
    }
    return memoryStore.complaints.filter((c) => !c.incidentId);
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
      // Query member complaint IDs from both complaints table and incident_reports table
      const [compRes, irRes] = await Promise.all([
        supabase.from('complaints').select('id').eq('incident_id', incidentId),
        supabase.from('incident_reports').select('complaint_id').eq('incident_id', incidentId),
      ]);

      const compIdsSet = new Set<string>();
      compRes.data?.forEach((c: any) => compIdsSet.add(c.id));
      irRes.data?.forEach((r: any) => compIdsSet.add(r.complaint_id));

      const compIds = Array.from(compIdsSet);
      if (compIds.length > 0) {
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

  // Incident Reports & Fusion Relations (Idempotent: updates if complaint association already exists)
  createIncidentReport: async (report: Omit<IncidentReportRecord, 'id'>) => {
    const supabase = getSupabase();
    if (supabase) {
      // Check if association already exists for this complaint
      const { data: existing } = await supabase
        .from('incident_reports')
        .select('id')
        .eq('complaint_id', report.complaintId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('incident_reports')
          .update({
            incident_id: report.incidentId,
            fusion_score: report.fusionScore,
            semantic_score: report.semanticScore,
            location_score: report.locationScore,
            time_score: report.timeScore,
            category_score: report.categoryScore,
          })
          .eq('id', existing.id);
        if (error) {
          console.error('Error updating incident_report in Supabase:', error);
        }
        return;
      }

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
    const existingIdx = memoryStore.incidentReports.findIndex((r) => r.complaintId === report.complaintId);
    if (existingIdx !== -1) {
      memoryStore.incidentReports[existingIdx] = {
        ...memoryStore.incidentReports[existingIdx],
        ...report,
      };
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
      const { data } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: true });
      if (data && data.length > 0) return data;
    }
    return memoryStore.departments;
  },
};
