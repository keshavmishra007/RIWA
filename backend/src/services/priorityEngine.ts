import {
  CivicCategory,
  IncidentPriority,
  IncidentTrend,
} from '../types/index.js';

export interface PriorityEvaluationInput {
  baseSeverity: IncidentPriority;
  category: CivicCategory;
  reportCount: number;
  hazards: string[];
  sensitiveLocations: string[];
  recentReportsInLastHour?: number;
}

export interface PriorityResult {
  priority: IncidentPriority;
  trend: IncidentTrend;
  reasoning: string[];
}

export const evaluatePriority = (input: PriorityEvaluationInput): PriorityResult => {
  const {
    baseSeverity,
    category,
    reportCount,
    hazards,
    sensitiveLocations,
    recentReportsInLastHour = 1,
  } = input;

  const reasoning: string[] = [];
  let priority = baseSeverity;

  // 1. Base Severity signal
  reasoning.push(`AI assessed base severity: ${baseSeverity}`);

  // 2. Deterministic Safety Overrides (PRD Section 13)
  const isElectrical = category === 'electrical_hazard';
  const hasLiveWire =
    hazards.includes('live_wire') ||
    hazards.includes('sparking') ||
    hazards.includes('exposed_wire');
  const nearSchool = sensitiveLocations.includes('school');
  const nearHospital = sensitiveLocations.includes('hospital');

  if (isElectrical && (hasLiveWire || nearSchool)) {
    priority = 'CRITICAL';
    reasoning.push('Safety Override: Electrical hazard near sensitive location (school/hospital) automatically escalated to CRITICAL.');
  } else if (nearHospital && (priority === 'LOW' || priority === 'MEDIUM')) {
    priority = 'HIGH';
    reasoning.push('Safety Override: Incident adjacent to medical facility elevated priority.');
  }

  // 3. Report Volume Scaling
  if (reportCount >= 10) {
    priority = 'CRITICAL';
    reasoning.push(`Volume Escalation: ${reportCount} confirmed citizen reports elevated status to CRITICAL.`);
  } else if (reportCount >= 6 && priority !== 'CRITICAL') {
    priority = 'HIGH';
    reasoning.push(`Volume Escalation: High report density (${reportCount} reports) elevated status to HIGH.`);
  } else if (reportCount >= 3 && priority === 'LOW') {
    priority = 'MEDIUM';
    reasoning.push(`Volume Escalation: Multiple corroborating reports (${reportCount}) increased priority to MEDIUM.`);
  }

  // 4. Trend & Incident Growth Assessment
  let trend: IncidentTrend = 'STABLE';
  if (recentReportsInLastHour >= 4) {
    trend = 'RAPIDLY_RISING';
    reasoning.push(`Escalation Trend: Rapid report surge detected (${recentReportsInLastHour} reports in last hour).`);
  } else if (recentReportsInLastHour >= 2) {
    trend = 'RISING';
    reasoning.push('Escalation Trend: Influx of reports indicates active situation.');
  }

  return {
    priority,
    trend,
    reasoning,
  };
};
