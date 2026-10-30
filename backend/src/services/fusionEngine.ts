import { ENV } from '../config/env.js';
import {
  CivicCategory,
  FusionDecision,
  FusionScoreBreakdown,
  IncidentPriority,
  IncidentRecord,
  IncidentStatus,
} from '../types/index.js';
import { calculateTextSimilarity, cosineSimilarity } from './embeddingService.js';

// Persistent infrastructure categories where defects remain physically present until repaired
export const PERSISTENT_INFRASTRUCTURE_CATEGORIES: ReadonlySet<CivicCategory> = new Set([
  'road_damage',
  'garbage',
  'drainage',
]);

// Active incident lifecycle statuses indicating the defect is still unresolved
export const ACTIVE_INCIDENT_STATUSES: ReadonlySet<IncidentStatus> = new Set([
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'REOPENED',
]);

// Maximum candidate lookback for active persistent infrastructure defects (30 days / 720 hours)
export const PERSISTENT_MAX_TIME_HOURS = 720;

/**
 * Determines whether a candidate incident is temporally eligible.
 * - Resolved/Closed incidents: strictly capped at ENV.FUSION_MAX_TIME_HOURS (48h)
 * - Transient categories (electrical, other): strictly capped at ENV.FUSION_MAX_TIME_HOURS (48h)
 * - Active persistent infrastructure defects: allowed up to PERSISTENT_MAX_TIME_HOURS (720h / 30 days)
 */
export const isCandidateWithinTimeWindow = (
  complaintTime: Date,
  incidentTime: Date,
  category?: CivicCategory | null,
  status?: IncidentStatus | null,
  marginMultiplier: number = 1.0,
  defaultMaxHours: number = ENV.FUSION_MAX_TIME_HOURS
): { isWithinWindow: boolean; diffHours: number; maxHours: number; isPersistentActive: boolean } => {
  const diffHours = Math.abs(complaintTime.getTime() - incidentTime.getTime()) / (1000 * 60 * 60);
  const isPersistentActive = Boolean(
    category &&
    PERSISTENT_INFRASTRUCTURE_CATEGORIES.has(category) &&
    status &&
    ACTIVE_INCIDENT_STATUSES.has(status)
  );

  const baseMaxHours = isPersistentActive ? PERSISTENT_MAX_TIME_HOURS : defaultMaxHours;
  const maxHours = baseMaxHours * marginMultiplier;

  return {
    isWithinWindow: diffHours < maxHours,
    diffHours,
    maxHours,
    isPersistentActive,
  };
};

// Haversine formula for distance in kilometers
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate location proximity score: 0km = 1.0, >= maxKm = 0.0
export const calculateLocationScore = (distanceKm: number, maxKm: number = ENV.FUSION_MAX_DISTANCE_KM): number => {
  if (distanceKm >= maxKm) return 0;
  return Math.max(0, 1 - distanceKm / maxKm);
};

// Calculate temporal proximity score: Non-linear decay for civic incidents
// 0–6h:   very strong decay (1.00 down to 0.90)
// 6–24h:  strong decay      (0.90 down to 0.70)
// 24–48h: moderate decay    (0.70 down to 0.35)
// >48h:   0.0 (outside candidate window)
export const calculateTimeScore = (
  timeA: Date,
  timeB: Date,
  maxHours: number = ENV.FUSION_MAX_TIME_HOURS
): number => {
  const diffHours = Math.abs(timeA.getTime() - timeB.getTime()) / (1000 * 60 * 60);
  if (diffHours >= maxHours) return 0;

  if (diffHours <= 6) {
    return 1.0 - (diffHours / 6) * 0.10;
  } else if (diffHours <= 24) {
    return 0.90 - ((diffHours - 6) / 18) * 0.20;
  } else {
    return 0.70 - ((diffHours - 24) / (maxHours - 24)) * 0.35;
  }
};

// Sub-domain categorization under the generic 'other' CivicCategory
export type OtherSubDomain = 'traffic' | 'animal' | 'general_civic';

export const resolveOtherDomain = (
  subcategory?: string | null,
  department?: string | null,
  title?: string | null,
  summary?: string | null
): OtherSubDomain | null => {
  const combined = `${subcategory || ''} ${department || ''} ${title || ''} ${summary || ''}`.toLowerCase();

  if (
    combined.includes('traffic') ||
    combined.includes('congestion') ||
    combined.includes('signal') ||
    combined.includes('parking') ||
    combined.includes('gridlock') ||
    combined.includes('chakka jam')
  ) {
    return 'traffic';
  }

  if (
    combined.includes('animal') ||
    combined.includes('cattle') ||
    combined.includes('cow') ||
    combined.includes('bull') ||
    combined.includes('dog') ||
    combined.includes('gaay') ||
    combined.includes('saand')
  ) {
    return 'animal';
  }

  if (
    combined.includes('general') ||
    combined.includes('other civic') ||
    combined.includes('encroachment') ||
    combined.includes('noise') ||
    combined.includes('miscellaneous')
  ) {
    return 'general_civic';
  }

  return null;
};

/**
 * Strict check for whether two items are eligible for AUTO_MERGE based on their primary categories.
 * Cross-category merges (e.g. waterlogging + traffic, road_damage + traffic) are strictly disallowed.
 */
export const isCategoryAutoMergeCompatible = (
  catA?: CivicCategory | null,
  catB?: CivicCategory | null,
  contextA?: { subcategory?: string | null; department?: string | null } | null,
  contextB?: { subcategory?: string | null; department?: string | null; title?: string | null; summary?: string | null } | null
): boolean => {
  if (!catA || !catB) return false;

  // Cross-category pairs can NEVER auto-merge (e.g. road_damage vs other, drainage vs other, etc.)
  if (catA !== catB) return false;

  // Both are the same core infrastructure category (road_damage, drainage, garbage, electrical_hazard)
  if (catA !== 'other') return true;

  // Both are 'other': verify sub-domain alignment (Traffic Police vs Animal Control vs General Civic)
  const domainA = resolveOtherDomain(contextA?.subcategory, contextA?.department);
  const domainB = resolveOtherDomain(contextB?.subcategory, contextB?.department, contextB?.title, contextB?.summary);

  if (domainA && domainB) {
    return domainA === domainB;
  }

  // If sub-domains cannot be positively matched, do not auto-merge
  return false;
};

// Category compatibility matrix (Root-Cause-First Primary Category Compatibility)
export const calculateCategoryScore = (
  catA?: CivicCategory | null,
  catB?: CivicCategory | null,
  contextA?: { subcategory?: string | null; department?: string | null } | null,
  contextB?: { subcategory?: string | null; department?: string | null; title?: string | null; summary?: string | null } | null
): number => {
  if (!catA || !catB) return 0.2; // Unspecified category is low compatibility

  if (catA === catB) {
    if (catA !== 'other') {
      return 1.0;
    }

    // Both are 'other'
    const domainA = resolveOtherDomain(contextA?.subcategory, contextA?.department);
    const domainB = resolveOtherDomain(contextB?.subcategory, contextB?.department, contextB?.title, contextB?.summary);

    if (domainA && domainB) {
      return domainA === domainB ? 1.0 : 0.0;
    }

    return 0.5; // Ambiguous sub-domains under 'other'
  }

  // Cross-Category Compatibility:
  // Distinct primary civic categories (e.g. drainage vs other:traffic, road_damage vs other:traffic,
  // electrical vs road_damage) are strictly incompatible at the candidate selection level (0.0).
  return 0.0;
};

// Normalized unit centroid of multiple embeddings
export const calculateCentroidEmbedding = (embeddings: number[][]): number[] => {
  if (!embeddings || embeddings.length === 0) return [];
  const dims = embeddings[0].length;
  const centroid = new Array(dims).fill(0);

  for (const emb of embeddings) {
    for (let i = 0; i < dims; i++) {
      centroid[i] += emb[i];
    }
  }

  let norm = 0;
  for (let i = 0; i < dims; i++) {
    centroid[i] /= embeddings.length;
    norm += centroid[i] * centroid[i];
  }
  const mag = Math.sqrt(norm);
  if (mag > 0) {
    for (let i = 0; i < dims; i++) {
      centroid[i] /= mag;
    }
  }
  return centroid;
};

export interface EvaluateFusionInput {
  complaintCode?: string;
  description: string;
  category: CivicCategory;
  subcategory?: string;
  department?: string;
  needsHumanReview?: boolean;
  latitude: number;
  longitude: number;
  createdAt: Date;
  embedding?: number[] | null;
  candidateIncidents: Array<
    IncidentRecord & {
      sampleDescriptions?: string[];
      incidentEmbedding?: number[] | null;
      complaintEmbeddings?: number[][];
      subcategory?: string;
    }
  >;
}

export const evaluateFusion = (input: EvaluateFusionInput): FusionScoreBreakdown => {
  const {
    complaintCode,
    description,
    category,
    subcategory,
    department,
    needsHumanReview,
    latitude,
    longitude,
    createdAt,
    embedding,
    candidateIncidents,
  } = input;

  if (!candidateIncidents || candidateIncidents.length === 0) {
    return {
      semanticScore: 0,
      locationScore: 0,
      timeScore: 0,
      categoryScore: 0,
      fusionScore: 0,
      decision: 'SEPARATE',
      explanation: 'No existing active incidents available to match.',
    };
  }

  const candidateMatches: Array<{
    incident: IncidentRecord;
    breakdown: FusionScoreBreakdown;
  }> = [];

  const contextA = { subcategory, department };

  // Evaluate ALL candidate incidents across the search space
  for (const incident of candidateIncidents) {
    const incCode = incident.incidentCode || incident.id;
    const contextB = {
      subcategory: (incident as any).subcategory,
      department: incident.departmentName || incident.aiRecommendedDepartment,
      title: incident.title,
      summary: incident.summary,
    };

    // 1. HARD GATE: Category Match (Root-Cause-First Primary Category Compatibility)
    const categoryScore = calculateCategoryScore(category, incident.category, contextA, contextB);
    if (categoryScore === 0) {
      console.log(`🔍 [Fusion Candidate Debug]
  complaint_code: ${complaintCode || 'NEW'}
  candidate_incident_code: ${incCode} ("${incident.title}")
  distance_km: N/A
  time_difference_hours: N/A
  category_new: ${category}
  category_incident: ${incident.category}
  semantic_score: 0.00
  location_score: 0.00
  time_score: 0.00
  category_score: 0.00
  final_fusion_score: 0.00
  decision: SEPARATE
  rejection_reason: CATEGORY_MISMATCH`);
      continue; // Skip incompatible categories completely
    }

    // 2. HARD GATE: Maximum Geographic Distance (0.5 km)
    const distanceKm = calculateDistanceKm(
      latitude,
      longitude,
      incident.latitude,
      incident.longitude
    );
    if (distanceKm > ENV.FUSION_MAX_DISTANCE_KM) {
      console.log(`🔍 [Fusion Candidate Debug]
  complaint_code: ${complaintCode || 'NEW'}
  candidate_incident_code: ${incCode} ("${incident.title}")
  distance_km: ${distanceKm.toFixed(3)}
  time_difference_hours: N/A
  category_new: ${category}
  category_incident: ${incident.category}
  semantic_score: 0.00
  location_score: 0.00
  time_score: 0.00
  category_score: ${categoryScore.toFixed(2)}
  final_fusion_score: 0.00
  decision: SEPARATE
  rejection_reason: DISTANCE_GATE`);
      continue; // Too far away to belong to same local incident
    }

    // Signal B: Location Proximity
    const locationScore = calculateLocationScore(distanceKm, ENV.FUSION_MAX_DISTANCE_KM);

    // 3. HARD GATE: Temporal Candidate Window (Status-Aware Lifecycle Fusion)
    const rawTime = (incident as any).updatedAt || (incident as any).updated_at || (incident as any).createdAt || (incident as any).created_at || new Date();
    const incidentTime = new Date(rawTime);
    
    const timeCheck = isCandidateWithinTimeWindow(
      createdAt,
      incidentTime,
      incident.category,
      incident.status,
      1.0,
      ENV.FUSION_MAX_TIME_HOURS
    );

    if (!timeCheck.isWithinWindow) {
      console.log(`🔍 [Fusion Candidate Debug]
  complaint_code: ${complaintCode || 'NEW'}
  candidate_incident_code: ${incCode} ("${incident.title}")
  distance_km: ${distanceKm.toFixed(3)}
  time_difference_hours: ${timeCheck.diffHours.toFixed(2)} (limit: ${timeCheck.maxHours}h, persistent_active: ${timeCheck.isPersistentActive})
  category_new: ${category}
  category_incident: ${incident.category}
  status: ${incident.status}
  semantic_score: 0.00
  location_score: ${locationScore.toFixed(3)}
  time_score: 0.00
  category_score: ${categoryScore.toFixed(2)}
  final_fusion_score: 0.00
  decision: SEPARATE
  rejection_reason: TIME_GATE`);
      continue; // Outside candidate temporal window
    }

    // Signal C: Temporal Proximity Score (smooth non-linear decay over appropriate window)
    const effectiveMaxTimeHours = timeCheck.isPersistentActive
      ? PERSISTENT_MAX_TIME_HOURS
      : ENV.FUSION_MAX_TIME_HOURS;
    const timeScore = calculateTimeScore(createdAt, incidentTime, effectiveMaxTimeHours);

    // Signal A: Semantic Similarity (Primary: Vector Cosine Similarity against members + centroid)
    let semanticScore = 0.5;
    if (embedding && incident.complaintEmbeddings && incident.complaintEmbeddings.length > 0) {
      // Compare against all individual member complaints
      const memberScores = incident.complaintEmbeddings.map((emb) => cosineSimilarity(embedding, emb));
      const maxMemberScore = Math.max(...memberScores);

      // Compare against normalized centroid of the cluster
      const centroidEmb = calculateCentroidEmbedding(incident.complaintEmbeddings);
      const centroidScore = centroidEmb.length > 0 ? cosineSimilarity(embedding, centroidEmb) : 0;

      semanticScore = Math.max(maxMemberScore, centroidScore);
    } else if (embedding && incident.incidentEmbedding) {
      semanticScore = cosineSimilarity(embedding, incident.incidentEmbedding);
    } else {
      // Fallback text overlap against title and summary (with Hinglish keyword support)
      const textToCompare = `${incident.title} ${incident.summary}`;
      semanticScore = calculateTextSimilarity(description, textToCompare);
    }

    // Weighted composite fusion score (PRD Section 15)
    // Weights: Semantic 35%, Location 35%, Time 15%, Category 15%
    const fusionScore =
      semanticScore * 0.35 +
      locationScore * 0.35 +
      timeScore * 0.15 +
      categoryScore * 0.15;

    // Decision Bands (PRD Section 16 with Root-Cause Primary Category Strict Compatibility)
    let decision: FusionDecision = 'SEPARATE';
    let rejectionReason = 'LOW_FUSION_SCORE';

    // Verify auto-merge category eligibility (Root-Cause Strict Compatibility)
    const isAutoMergeEligible = isCategoryAutoMergeCompatible(
      category,
      incident.category,
      contextA,
      contextB
    );

    if (fusionScore >= ENV.FUSION_AUTO_MERGE_THRESHOLD) {
      if (isAutoMergeEligible && !needsHumanReview) {
        decision = 'AUTO_MERGE';
        rejectionReason = 'AUTO_MERGE';
      } else {
        // High composite score but cross-category or uncertain classification:
        // Safely demote to REVIEW to prevent improper auto-merge!
        decision = 'REVIEW';
        rejectionReason = !isAutoMergeEligible
          ? 'CATEGORY_INCOMPATIBLE_DEMOTED_TO_REVIEW'
          : 'UNCERTAIN_CLASSIFICATION_HUMAN_REVIEW';
      }
    } else if (fusionScore >= ENV.FUSION_REVIEW_THRESHOLD) {
      decision = 'REVIEW';
      rejectionReason = 'HUMAN_REVIEW';
    } else if (semanticScore < 0.45) {
      rejectionReason = 'LOW_SEMANTIC_SIMILARITY';
    }

    // Full candidate diagnostic log (Step 2)
    console.log(`🔍 [Fusion Candidate Debug]
  complaint_code: ${complaintCode || 'NEW'}
  candidate_incident_code: ${incCode} ("${incident.title}")
  distance_km: ${distanceKm.toFixed(3)} (~${(distanceKm * 1000).toFixed(0)}m)
  time_difference_hours: ${timeCheck.diffHours.toFixed(2)} (window: ${effectiveMaxTimeHours}h, persistent: ${timeCheck.isPersistentActive})
  category_new: ${category}
  category_incident: ${incident.category}
  status: ${incident.status}
  semantic_score: ${semanticScore.toFixed(3)} (${(semanticScore * 100).toFixed(1)}%)
  location_score: ${locationScore.toFixed(3)}
  time_score: ${timeScore.toFixed(3)}
  category_score: ${categoryScore.toFixed(2)}
  final_fusion_score: ${fusionScore.toFixed(3)} (${(fusionScore * 100).toFixed(1)}%)
  decision: ${decision}
  rejection_reason: ${rejectionReason}`);

    const explanation = `Semantic similarity: ${(semanticScore * 100).toFixed(0)}%, Location proximity: ${(locationScore * 100).toFixed(0)}% (~${(distanceKm * 1000).toFixed(0)}m), Time proximity: ${(timeScore * 100).toFixed(0)}%, Category match: ${(categoryScore * 100).toFixed(0)}%. Fusion confidence: ${(fusionScore * 100).toFixed(0)}%`;

    const currentResult: FusionScoreBreakdown = {
      semanticScore: parseFloat(semanticScore.toFixed(2)),
      locationScore: parseFloat(locationScore.toFixed(2)),
      timeScore: parseFloat(timeScore.toFixed(2)),
      categoryScore: parseFloat(categoryScore.toFixed(2)),
      fusionScore: parseFloat(fusionScore.toFixed(2)),
      decision,
      matchedIncidentId: incident.id,
      explanation,
    };

    if (currentResult.decision !== 'SEPARATE') {
      candidateMatches.push({
        incident,
        breakdown: currentResult,
      });
    }
  }

  if (candidateMatches.length === 0) {
    return {
      semanticScore: 0,
      locationScore: 0,
      timeScore: 0,
      categoryScore: 0,
      fusionScore: 0,
      decision: 'SEPARATE',
      explanation: 'No related incident found exceeding the fusion threshold. A new civic incident will be created.',
    };
  }

  // Sort candidate matches by fusionScore descending
  candidateMatches.sort((a, b) => b.breakdown.fusionScore - a.breakdown.fusionScore);

  const topMatch = candidateMatches[0];

  // Tie-breaker: If multiple active candidates both qualify for AUTO_MERGE within close score margin (0.03),
  // do not arbitrarily merge; demote to REVIEW for safe human verification.
  if (candidateMatches.length > 1 && topMatch.breakdown.decision === 'AUTO_MERGE') {
    const runnerUp = candidateMatches[1];
    if (
      runnerUp.breakdown.decision === 'AUTO_MERGE' &&
      topMatch.breakdown.fusionScore - runnerUp.breakdown.fusionScore < 0.03
    ) {
      const topCode = topMatch.incident.incidentCode || topMatch.incident.id;
      const runnerCode = runnerUp.incident.incidentCode || runnerUp.incident.id;
      return {
        ...topMatch.breakdown,
        decision: 'REVIEW',
        explanation: `Multiple plausible active incident matches detected (${topCode} at ${(topMatch.breakdown.fusionScore * 100).toFixed(0)}% and ${runnerCode} at ${(runnerUp.breakdown.fusionScore * 100).toFixed(0)}%). Demoted to human review to prevent arbitrary auto-merge.`,
      };
    }
  }

  return topMatch.breakdown;
};
