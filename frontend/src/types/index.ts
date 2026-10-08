// ─── Priority & Status ───────────────────────────────────────────────

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REOPENED'
  | 'CLOSED';

export type IncidentTrend = 'STABLE' | 'RISING' | 'RAPIDLY_RISING';

// ─── User & Auth ─────────────────────────────────────────────────────

export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── Civic Categories ────────────────────────────────────────────────

export type CivicCategory =
  | 'drainage'
  | 'garbage'
  | 'road_damage'
  | 'electrical_hazard'
  | 'other';

export const CATEGORY_LABELS: Record<CivicCategory, string> = {
  drainage: 'Drainage / Waterlogging',
  garbage: 'Garbage',
  road_damage: 'Road Damage',
  electrical_hazard: 'Streetlight / Electrical',
  other: 'Other Civic Services',
};

export const CATEGORY_DEPARTMENTS: Record<CivicCategory, string> = {
  drainage: 'Municipal Engineering',
  garbage: 'Sanitation',
  road_damage: 'Public Works',
  electrical_hazard: 'Electrical',
  other: 'Other Civic Services',
};

// ─── Complaint / Report ──────────────────────────────────────────────

export interface Complaint {
  id: string;
  complaintCode?: string;
  userId: string;
  description: string;
  rawText?: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  category?: CivicCategory;
  status: IncidentStatus;
  incidentId?: string;
  createdAt: string;
}

// ─── AI Analysis ─────────────────────────────────────────────────────

export interface AIAnalysis {
  complaintId: string;
  category: CivicCategory;
  subcategory: string;
  severity: IncidentPriority;
  summary: string;
  department: string;
  confidence: number;
  keywords: string[];
  hazards: string[];
}

// ─── Fusion Explanation ──────────────────────────────────────────────

export interface FusionExplanation {
  semanticScore: number;
  locationScore: number;
  timeScore: number;
  categoryScore: number;
  confidence: number;
}

// ─── Incident ────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  incidentCode?: string;
  title: string;
  category: CivicCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  reportCount: number;
  department: string;
  departmentId?: string;
  departmentName?: string;
  fusionConfidence: number;
  trend: IncidentTrend;
  summary: string;
  aiBrief: string;
  recommendedActions: string[];
  areaKm: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentReport {
  incidentId: string;
  complaintId: string;
  complaint: Complaint;
  fusionScore: number;
  semanticScore: number;
  locationScore: number;
  timeScore: number;
  categoryScore: number;
}

// ─── Status Log ──────────────────────────────────────────────────────

export interface StatusLog {
  incidentId: string;
  status: IncidentStatus;
  actorId: string;
  actorName: string;
  note: string;
  timestamp: string;
}

// ─── Hotspot ─────────────────────────────────────────────────────────

export interface Hotspot {
  id: string;
  incidentId?: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  incidentCount: number;
  category: CivicCategory;
  severity: IncidentPriority;
  trend: IncidentTrend;
  label: string;
  radius: number;
}

// ─── Department ──────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  activeIncidents: number;
  criticalIncidents: number;
  pendingIncidents: number;
  resolvedIncidents: number;
  avgResponseTime: string;
}

// ─── Analytics ───────────────────────────────────────────────────────

export interface AnalyticsOverview {
  totalReports: number;
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  emergingHotspots: number;
  reportsToday: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  categoryDistribution: { category: string; count: number; percentage: number }[];
  priorityDistribution: { priority: string; count: number }[];
  dailyTrends: { date: string; reports: number; incidents: number }[];
  departmentWorkload: { department: string; active: number; resolved: number }[];
}

// ─── KPI Card ────────────────────────────────────────────────────────

export interface KPIData {
  label: string;
  value: number | string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}
