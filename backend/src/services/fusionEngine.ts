import { ENV } from '../config/env.js';
import {
  CivicCategory,
  FusionDecision,
  FusionScoreBreakdown,
  IncidentRecord,
} from '../types/index.js';
import { calculateTextSimilarity, cosineSimilarity } from './embeddingService.js';

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

// Category compatibility matrix
export const calculateCategoryScore = (
  catA?: CivicCategory | null,
  catB?: CivicCategory | null
): number => {
  if (!catA || !catB) return 0.5; // Unspecified category allows soft compatibility
  if (catA === catB) return 1.0;
  // 'other' allows soft compatibility (0.6) with specific categories when strong semantic & location evidence exists
  if (catA === 'other' || catB === 'other') return 0.6;
  // Distinct civic categories (drainage vs electrical vs road_damage) are strictly incompatible
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
  latitude: number;
  longitude: number;
  createdAt: Date;
  embedding?: number[] | null;
  candidateIncidents: Array<
    IncidentRecord & {
      sampleDescriptions?: string[];
      incidentEmbedding?: number[] | null;
      complaintEmbeddings?: number[][];
    }
  >;
}

export const evaluateFusion = (input: EvaluateFusionInput): FusionScoreBreakdown => {
  const {
    complaintCode,
    description,
    category,
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

  let bestMatch: {
    incident: IncidentRecord;
    breakdown: FusionScoreBreakdown;
  } | null = null;

  // Evaluate ALL candidate incidents across the search space
  for (const incident of candidateIncidents) {
    const incCode = incident.incidentCode || incident.id;

    // 1. HARD GATE: Category Match
    const categoryScore = calculateCategoryScore(category, incident.category);
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

    // 3. HARD GATE: Temporal Candidate Window (48h)
    const rawTime = (incident as any).updatedAt || (incident as any).updated_at || (incident as any).createdAt || (incident as any).created_at || new Date();
    const incidentTime = new Date(rawTime);
    const diffHours = Math.abs(createdAt.getTime() - incidentTime.getTime()) / (1000 * 60 * 60);
    if (diffHours >= ENV.FUSION_MAX_TIME_HOURS) {
      console.log(`🔍 [Fusion Candidate Debug]
  complaint_code: ${complaintCode || 'NEW'}
  candidate_incident_code: ${incCode} ("${incident.title}")
  distance_km: ${distanceKm.toFixed(3)}
  time_difference_hours: ${diffHours.toFixed(2)}
  category_new: ${category}
  category_incident: ${incident.category}
  semantic_score: 0.00
  location_score: ${locationScore.toFixed(3)}
  time_score: 0.00
  category_score: ${categoryScore.toFixed(2)}
  final_fusion_score: 0.00
  decision: SEPARATE
  rejection_reason: TIME_GATE`);
      continue; // Outside candidate temporal window
    }

    // Signal C: Temporal Proximity Score (smooth non-linear decay)
    const timeScore = calculateTimeScore(createdAt, incidentTime, ENV.FUSION_MAX_TIME_HOURS);

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

    // Decision Bands (PRD Section 16)
    let decision: FusionDecision = 'SEPARATE';
    let rejectionReason = 'LOW_FUSION_SCORE';

    if (fusionScore >= ENV.FUSION_AUTO_MERGE_THRESHOLD) {
      decision = 'AUTO_MERGE';
      rejectionReason = 'AUTO_MERGE';
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
  time_difference_hours: ${diffHours.toFixed(2)}
  category_new: ${category}
  category_incident: ${incident.category}
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

    if (!bestMatch || currentResult.fusionScore > bestMatch.breakdown.fusionScore) {
      bestMatch = {
        incident,
        breakdown: currentResult,
      };
    }
  }

  if (bestMatch && bestMatch.breakdown.decision !== 'SEPARATE') {
    return bestMatch.breakdown;
  }

  return {
    semanticScore: 0,
    locationScore: 0,
    timeScore: 0,
    categoryScore: 0,
    fusionScore: 0,
    decision: 'SEPARATE',
    explanation: 'No related incident found exceeding the fusion threshold. A new civic incident will be created.',
  };
};
