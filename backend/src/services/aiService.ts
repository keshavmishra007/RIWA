import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ENV, isGeminiConfigured } from '../config/env.js';
import { AIAnalysisResult, CivicCategory, IncidentPriority } from '../types/index.js';

// Schema validation for LLM extraction
const AIAnalysisSchema = z.object({
  category: z.enum(['drainage', 'garbage', 'road_damage', 'electrical_hazard', 'other']),
  subcategory: z.string().default('general'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  summary: z.string(),
  department: z.string(),
  supportingDepartment: z.string().nullable().optional().transform((v) => v || undefined),
  needsHumanReview: z.boolean().nullable().optional().transform((v) => v ?? false),
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()).default([]),
  hazards: z.array(z.string()).default([]),
  sensitiveLocations: z.array(z.string()).default([]),
});

const genAI = isGeminiConfigured() ? new GoogleGenerativeAI(ENV.GEMINI_API_KEY) : null;

export const analyzeCitizenReport = async (description: string): Promise<AIAnalysisResult> => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `
You are the AI Intelligence Engine of RiWA (Rewa Intelligence for Work and Action), an urban civic incident intelligence platform for Rewa, Madhya Pradesh.
Analyze the following citizen report (which may be in English, Hindi, or Hinglish):

Citizen Report:
"${description}"

Perform:
1. Category Classification: one of ['drainage', 'garbage', 'road_damage', 'electrical_hazard', 'other']
   - 'drainage': clogged drains, sewer overflows, waterlogging, standing water, open drains
   - 'garbage': overflowing dumpsters, uncollected trash, illegal garbage dumps, rotten waste, scattered garbage, plastic/polyethene waste, hospital/school campus garbage, public litter
   - 'road_damage': potholes, broken road surface, sinkholes, road collapse (DO NOT classify traffic jams as road damage!)
   - 'electrical_hazard': live wires, sparking wires, dangling power lines, broken streetlights
   - 'other': traffic congestion, traffic jams, broken traffic signals, stray animals, noise, encroachment, public infrastructure not fitting above 4 categories. If uncertain, classify as 'other'.
2. Subcategory (e.g. 'waterlogging', 'blocked_drain', 'overflowing_bin', 'deep_pothole', 'sparking_wire', 'traffic_congestion', 'general_civic')
3. Severity Assessment:
   - 'CRITICAL': life hazard, live electric wire, sparking near school/crowds, massive road collapse, hospital access blocked
   - 'HIGH': heavy waterlogging blocking vehicles, large potholes on main roads, major traffic jams, bio/chemical waste
   - 'MEDIUM': standard garbage pile, dark streetlights, potholes on residential streets, moderate traffic
   - 'LOW': minor litter, non-urgent maintenance
4. Department Routing (must choose strictly from these 7 municipal departments):
   - "Municipal Engineering": Blocked drains, drainage infrastructure, sewers, waterlogging.
   - "Sanitation": Garbage dumps, overflowing bins, uncollected waste, public litter.
   - "Public Works": Potholes, damaged roads, broken tarmac, structural road damage.
   - "Electrical": Broken streetlights, live wires, sparking wires, electrical hazards.
   - "Animal Control": Stray cows, cattle roaming, animals obstructing roads or public spaces, sick or injured animals.
   - "Traffic Police": Traffic congestion, traffic jams, signal failures, illegal parking, road obstructions.
   - "Other Civic Services": Miscellaneous civic complaints not fitting the six departments above, or ambiguous reports requiring human review.
   If cows or animals are blocking traffic, set department to "Animal Control" and supportingDepartment to "Traffic Police".
5. Multilingual normalization into a concise, formal English summary (1-2 sentences).
6. Extraction of keywords, hazards (e.g. 'sparking', 'exposed_wire', 'deep_water', 'traffic_gridlock', 'animal_hazard'), and sensitive locations ('school', 'hospital', 'market', 'bus_stand').
7. Confidence score between 0.0 and 1.0.

Return strictly JSON matching this structure:
{
  "category": "other",
  "subcategory": "traffic_congestion",
  "severity": "HIGH",
  "summary": "...",
  "department": "Traffic Police",
  "supportingDepartment": "Animal Control",
  "needsHumanReview": false,
  "confidence": 0.95,
  "keywords": ["traffic", "hospital"],
  "hazards": ["gridlock"],
  "sensitiveLocations": ["hospital", "market"]
}
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);
      const validated = AIAnalysisSchema.parse(parsed);

      console.log(`🤖 [AI Engine] Real Gemini analysis generated via ${ENV.GEMINI_MODEL}`);
      return {
        ...(validated as AIAnalysisResult),
        isAiGenerated: true,
        aiProvider: `Google Gemini (${ENV.GEMINI_MODEL})`,
      };
    } catch (error: any) {
      console.warn(`⚠️ [AI Engine] Gemini generation unavailable (${error?.message || error}). Explicitly falling back to rule-based civic heuristic.`);
      return fallbackHeuristicAnalysis(description, error?.message);
    }
  }

  console.warn('⚠️ [AI Engine] Gemini API key not configured. Explicitly falling back to rule-based civic heuristic.');
  // Fallback Rule-Based & Keyword Heuristic Engine
  return fallbackHeuristicAnalysis(description, 'Gemini API key not configured');
};

const fallbackHeuristicAnalysis = (text: string, reason?: string): AIAnalysisResult => {
  const lower = text.toLowerCase();

  let category: CivicCategory = 'drainage';
  let subcategory = 'waterlogging';
  let severity: IncidentPriority = 'MEDIUM';
  let department = 'Municipal Engineering';
  const hazards: string[] = [];
  const sensitiveLocations: string[] = [];
  const keywords: string[] = [];

  // Check sensitive locations
  if (lower.includes('school') || lower.includes('vidyalaya') || lower.includes('college')) {
    sensitiveLocations.push('school');
  }
  if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('doctor')) {
    sensitiveLocations.push('hospital');
  }
  if (lower.includes('market') || lower.includes('bazaar') || lower.includes('chowk') || lower.includes('chauraha')) {
    sensitiveLocations.push('market');
  }

  let supportingDepartment: string | undefined = undefined;
  let needsHumanReview = false;

  // Classification rules
  if (
    lower.includes('wire') ||
    lower.includes('spark') ||
    lower.includes('light') ||
    lower.includes('electric') ||
    lower.includes('bijli') ||
    lower.includes('pole') ||
    lower.includes('current')
  ) {
    category = 'electrical_hazard';
    department = 'Electrical';
    subcategory = lower.includes('spark') ? 'sparking_hazard' : 'streetlight_fault';
    if (lower.includes('spark') || lower.includes('wire') || lower.includes('current')) {
      hazards.push('live_wire');
      severity = sensitiveLocations.includes('school') ? 'CRITICAL' : 'HIGH';
    } else {
      severity = 'LOW';
    }
    keywords.push('electrical', 'hazard');
  } else if (
    lower.includes('water') ||
    lower.includes('paani') ||
    lower.includes('flood') ||
    lower.includes('drain') ||
    lower.includes('nala') ||
    lower.includes('naali') ||
    lower.includes('waterlog') ||
    lower.includes('sewer') ||
    lower.includes('sewage') ||
    lower.includes('overflow')
  ) {
    category = 'drainage';
    department = 'Municipal Engineering';
    subcategory = lower.includes('drain') || lower.includes('nala') || lower.includes('naali') ? 'drain_overflow' : 'waterlogging';
    if (lower.includes('flood') || lower.includes('submerged') || lower.includes('stuck') || lower.includes('deep')) {
      severity = 'HIGH';
      hazards.push('submerged_road');
    }
    keywords.push('waterlogging', 'drainage');
  } else if (
    lower.includes('garbage') ||
    lower.includes('kachra') ||
    lower.includes('kuda') ||
    lower.includes('dump') ||
    lower.includes('waste') ||
    lower.includes('dustbin') ||
    lower.includes('smell') ||
    lower.includes('polyethene') ||
    lower.includes('polythene') ||
    lower.includes('plastic') ||
    lower.includes('litter')
  ) {
    category = 'garbage';
    department = 'Sanitation';
    subcategory = 'waste_accumulation';
    severity = lower.includes('huge') || lower.includes('water body') || lower.includes('lake') ? 'HIGH' : 'MEDIUM';
    keywords.push('waste', 'sanitation');
  } else if (
    lower.includes('cow') ||
    lower.includes('cattle') ||
    lower.includes('gaay') ||
    lower.includes('gaye') ||
    lower.includes('saand') ||
    lower.includes('bull') ||
    lower.includes('bovine') ||
    lower.includes('stray animal') ||
    lower.includes('stray dog') ||
    lower.includes('injured animal') ||
    lower.includes('sick animal') ||
    lower.includes('animal bite')
  ) {
    // 5. Animal Control
    category = 'other';
    department = 'Animal Control';
    subcategory = lower.includes('injured') || lower.includes('sick') ? 'injured_animal' : 'stray_cattle';
    severity = lower.includes('injured') || lower.includes('bite') || sensitiveLocations.includes('school') ? 'HIGH' : 'MEDIUM';
    keywords.push('animal_control', 'stray_cattle');
    hazards.push('animal_obstruction');

    // If cows or animals are also blocking traffic or on the road
    if (lower.includes('traffic') || lower.includes('jam') || lower.includes('road') || lower.includes('sadak')) {
      supportingDepartment = 'Traffic Police';
    }
  } else if (
    lower.includes('traffic') ||
    lower.includes('jam') ||
    lower.includes('congestion') ||
    lower.includes('signal') ||
    lower.includes('traffic light') ||
    lower.includes('parking') ||
    lower.includes('gridlock') ||
    lower.includes('chakka jam')
  ) {
    // 6. Traffic Police
    category = 'other';
    department = 'Traffic Police';
    subcategory = lower.includes('signal') ? 'traffic_signal_fault' : 'traffic_congestion';
    severity = lower.includes('hospital') || lower.includes('emergency') || lower.includes('gridlock') ? 'HIGH' : 'MEDIUM';
    hazards.push('traffic_gridlock');
    keywords.push('traffic_police', 'congestion');
  } else if (
    lower.includes('pothole') ||
    lower.includes('gaddha') ||
    lower.includes('broken road') ||
    lower.includes('broken tarmac') ||
    lower.includes('sadak kharab') ||
    lower.includes('sinkhole') ||
    (lower.includes('road') && (lower.includes('damage') || lower.includes('crack') || lower.includes('repaire')))
  ) {
    category = 'road_damage';
    department = 'Public Works';
    subcategory = 'potholes';
    severity = lower.includes('nh-7') || lower.includes('highway') || lower.includes('bypass') ? 'HIGH' : 'MEDIUM';
    keywords.push('pothole', 'road');
  } else {
    // 7. Other Civic Services (Miscellaneous / General civic / Ambiguous)
    category = 'other';
    department = 'Other Civic Services';
    subcategory = 'general_civic';
    needsHumanReview = true;
    keywords.push('civic');
  }

  return {
    category,
    subcategory,
    severity,
    summary: text.length > 120 ? `${text.substring(0, 117)}...` : text,
    department,
    supportingDepartment,
    needsHumanReview,
    confidence: needsHumanReview ? 0.65 : 0.88,
    keywords,
    hazards,
    sensitiveLocations,
    isAiGenerated: false,
    aiProvider: 'Civic Heuristic Fallback',
    fallbackReason: reason,
  };
};

export const generateIncidentBrief = async (
  title: string,
  category: string,
  reportCount: number,
  descriptions: string[]
): Promise<{ summary: string; aiBrief: string; recommendedActions: string[] }> => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: ENV.GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `
Generate an authoritative civic Incident Intelligence Brief for Rewa municipal authorities.
Incident: "${title}" (Category: ${category})
Number of fused citizen reports: ${reportCount}
Citizen report samples:
${descriptions.slice(0, 5).map((d, i) => `${i + 1}. "${d}"`).join('\n')}

Produce JSON with:
1. summary: A 1-2 sentence executive operational summary.
2. aiBrief: A 2-3 sentence strategic situation appraisal highlighting urgency, growth, and potential infrastructure failure.
3. recommendedActions: An array of 3-5 concrete, actionable steps for the responsible department.

JSON structure:
{
  "summary": "...",
  "aiBrief": "...",
  "recommendedActions": ["step 1", "step 2", "step 3"]
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      return {
        summary: parsed.summary,
        aiBrief: parsed.aiBrief,
        recommendedActions: parsed.recommendedActions || [],
      };
    } catch (error) {
      console.warn('⚠️ Gemini briefing generation failed, using template brief:', error);
    }
  }

  // Template fallback
  return {
    summary: `Multiple citizen reports indicate ${category} incident requiring municipal intervention. ${reportCount} complaints recorded.`,
    aiBrief: `Citizen reports indicate recurring issues around the site. Reports are geographically concentrated and have escalated within the current monitoring window. Department response recommended.`,
    recommendedActions: [
      `Inspect site and assess infrastructure impact`,
      `Deploy municipal response team for immediate containment`,
      `Coordinate with local traffic authorities if access is impeded`,
      `Reassess site post-intervention to confirm resolution`,
    ],
  };
};
