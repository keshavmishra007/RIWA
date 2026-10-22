export type UserRole = 'CITIZEN' | 'AUTHORITY' | 'ADMIN';

export type CivicCategory =
  | 'drainage'
  | 'garbage'
  | 'road_damage'
  | 'electrical_hazard'
  | 'other';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REOPENED'
  | 'CLOSED';

export type IncidentTrend = 'STABLE' | 'RISING' | 'RAPIDLY_RISING';

export type FusionDecision = 'AUTO_MERGE' | 'REVIEW' | 'SEPARATE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AIAnalysisResult {
  category: CivicCategory;
  subcategory: string;
  severity: IncidentPriority;
  summary: string;
  department: string;
  supportingDepartment?: string;
  needsHumanReview?: boolean;
  confidence: number;
  keywords: string[];
  hazards: string[];
  sensitiveLocations: string[];
  isAiGenerated: boolean;
  aiProvider: string;
  fallbackReason?: string;
}

export interface FusionScoreBreakdown {
  semanticScore: number;
  locationScore: number;
  timeScore: number;
  categoryScore: number;
  fusionScore: number;
  decision: FusionDecision;
  matchedIncidentId?: string;
  explanation: string;
}

export interface ComplaintRecord {
  id: string;
  complaintCode: string;
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

export interface IncidentRecord {
  id: string;
  incidentCode: string;
  title: string;
  category: CivicCategory;
  latitude: number;
  longitude: number;
  priority: IncidentPriority;
  status: IncidentStatus;
  fusionConfidence: number;
  departmentId?: string;
  departmentName?: string;
  aiRecommendedDepartment?: string;
  supportingDepartment?: string;
  needsHumanReview?: boolean;
  summary: string;
  aiBrief: string;
  recommendedActions: string[];
  reportCount: number;
  areaKm: number;
  trend: IncidentTrend;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentReportRecord {
  id: string;
  incidentId: string;
  complaintId: string;
  fusionScore: number;
  semanticScore: number;
  locationScore: number;
  timeScore: number;
  categoryScore: number;
  createdAt: string;
}
