import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ENV, isGeminiConfigured } from '../config/env.js';
import {
  calculateCategoryScore,
  calculateDistanceKm,
  calculateLocationScore,
  calculateTimeScore,
} from '../services/fusionEngine.js';
import { calculateTextSimilarity } from '../services/embeddingService.js';
import type { CivicCategory, FusionDecision } from '../types/index.js';

// Strict Zod schema for structured visual comparison output
export const VisualComparisonSchema = z.object({
  isSameIssueType: z.boolean(),
  issueTypeA: z.string(),
  issueTypeB: z.string(),
  sharedVisualDetails: z.array(z.string()),
  meaningfulDifferences: z.array(z.string()),
  couldBeSamePhysicalIncident: z.boolean(),
  visualSimilarityScore: z.number().min(0).max(1),
  uncertaintyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  explanation: z.string(),
});

export type VisualComparisonOutput = z.infer<typeof VisualComparisonSchema>;

export interface ComplaintCandidateInput {
  id: string;
  code: string;
  category?: CivicCategory | null;
  description: string;
  latitude: number;
  longitude: number;
  createdAt: string | Date;
  imageUrl?: string | null;
}

export type ShadowRecommendation =
  | 'CONFIRM_MERGE'
  | 'DEMOTE_SEPARATE'
  | 'MAINTAIN_REVIEW'
  | 'SKIPPED'
  | 'ERROR';

export interface ShadowEvaluationRecord {
  id: string;
  evaluatedAt: string;
  complaintCodeA: string;
  complaintCodeB: string;
  baselineDecision: FusionDecision;
  baselineScore: number;
  breakdown: {
    semanticScore: number;
    locationScore: number;
    timeScore: number;
    categoryScore: number;
  };
  shadowRecommendation: ShadowRecommendation;
  visualScore: number | null;
  visualUncertainty: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  rationale: string;
  latencyMs: number;
  modelVersion: string;
  status: 'SUCCESS' | 'SKIPPED' | 'MALFORMED_RESPONSE' | 'API_ERROR' | 'DISABLED';
  errorDetails?: string | null;
}

export interface ShadowWorkerOptions {
  enabled?: boolean;
  outputDir?: string;
  geminiModel?: string;
  apiKey?: string;
  maxRetries?: number;
}

/**
 * PII and Secret Sanitizer
 * Removes phone numbers, emails, and scrub API keys / bearer tokens from strings.
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  return input
    // Scrub potential Gemini API keys (AIza... or AQ....)
    .replace(/(?:AIza[a-zA-Z0-9_\-]{30,}|AQ\.[a-zA-Z0-9_\-\.]{25,}|AQ[a-zA-Z0-9_\-\.]{25,})/g, '[REDACTED_API_KEY]')
    // Scrub JWT tokens
    .replace(/eyJ[a-zA-Z0-9_\-]{20,}\.[a-zA-Z0-9_\-]{20,}\.[a-zA-Z0-9_\-]{20,}/g, '[REDACTED_JWT]')
    // Scrub phone numbers (Indian 10-digit / 5-5 split, +91, and international formats)
    .replace(/(?:\+?91[-.\s]?)?[6-9]\d{4}[-.\s]?\d{5}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/g, '[REDACTED_PHONE]')
    // Scrub emails
    .replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, '[REDACTED_EMAIL]');
};

/**
 * Validates and sanitizes image URL:
 * Enforces http/https and strips credential queries.
 */
export const sanitizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    // Return sanitized URL (without username/password)
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return null;
  }
};

/**
 * Standalone Shadow Fusion Worker
 * Operates strictly decoupled from production workflows.
 * Default: DISABLED (kill switch OFF).
 * Output: Local append-only JSONL storage (zero writes to Supabase).
 */
export class ShadowFusionWorker {
  private enabled: boolean;
  private outputDir: string;
  private outputFilePath: string;
  private geminiModel: string;
  private genAI: GoogleGenerativeAI | null = null;
  private maxRetries: number;

  constructor(opts?: ShadowWorkerOptions) {
    // Kill switch strictly defaults to false unless explicitly configured true
    this.enabled = opts?.enabled ?? ENV.SHADOW_FUSION_ENABLED;
    this.outputDir = opts?.outputDir ?? path.resolve(process.cwd(), ENV.SHADOW_OUTPUT_DIR);
    this.outputFilePath = path.join(this.outputDir, 'evaluations.jsonl');
    this.geminiModel = opts?.geminiModel ?? ENV.GEMINI_MODEL;
    this.maxRetries = opts?.maxRetries ?? 2;

    const key = opts?.apiKey || ENV.GEMINI_API_KEY;
    if (key && !key.includes('your-gemini')) {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getOutputFilePath(): string {
    return this.outputFilePath;
  }

  /**
   * Safely writes a shadow record to the local append-only JSONL log.
   * GUARANTEE: Does NOT write to Supabase or any production database table.
   */
  private appendToLocalLog(record: ShadowEvaluationRecord): void {
    try {
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
      const line = JSON.stringify(record) + '\n';
      fs.appendFileSync(this.outputFilePath, line, 'utf8');
    } catch (err: any) {
      console.error('[Shadow Worker File System Error]:', sanitizeString(err?.message || 'Failed to write local log'));
    }
  }

  /**
   * Safely fetches an image and converts to base64.
   * Limits download time and payload size.
   */
  public async fetchImageSafe(
    rawUrl: string | null | undefined,
    timeoutMs = 8000,
    maxBytes = 5 * 1024 * 1024
  ): Promise<{ base64: string; mimeType: string } | null> {
    const url = sanitizeImageUrl(rawUrl);
    if (!url) return null;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!resp.ok) return null;

      const mimeType = resp.headers.get('content-type') || 'image/jpeg';
      if (!mimeType.startsWith('image/')) return null;

      const arrayBuffer = await resp.arrayBuffer();
      if (arrayBuffer.byteLength < 200 || arrayBuffer.byteLength > maxBytes) {
        return null;
      }

      return {
        base64: Buffer.from(arrayBuffer).toString('base64'),
        mimeType,
      };
    } catch {
      return null;
    }
  }

  /**
   * Executes visual comparison via Gemini with retry and privacy sanitization.
   */
  private async executeVisualComparison(
    repA: ComplaintCandidateInput,
    repB: ComplaintCandidateInput,
    imgA: { base64: string; mimeType: string },
    imgB: { base64: string; mimeType: string }
  ): Promise<{ output: VisualComparisonOutput | null; error?: string; status: ShadowEvaluationRecord['status'] }> {
    if (!this.genAI) {
      return { output: null, error: 'Gemini client not initialized or missing API key', status: 'API_ERROR' };
    }

    const sanitizedDescA = sanitizeString(repA.description);
    const sanitizedDescB = sanitizeString(repB.description);

    const prompt = `You are a civic intelligence verification AI.
Compare these two citizen reports for duplicate clustering:
- Report 1 (${repA.code}): "${sanitizedDescA}"
- Report 2 (${repB.code}): "${sanitizedDescB}"

TASK:
1. Determine if both images depict the exact same physical incident site (not merely the same issue type).
2. Look for distinctive physical landmarks, signs, structures, or exact spatial features.
3. If they are different places in the same city, couldBeSamePhysicalIncident must be false.
4. Provide a visualSimilarityScore from 0.00 to 1.00 and uncertaintyLevel ("LOW", "MEDIUM", "HIGH").

Return strict JSON:
{
  "isSameIssueType": boolean,
  "issueTypeA": string,
  "issueTypeB": string,
  "sharedVisualDetails": string[],
  "meaningfulDifferences": string[],
  "couldBeSamePhysicalIncident": boolean,
  "visualSimilarityScore": number,
  "uncertaintyLevel": "LOW" | "MEDIUM" | "HIGH",
  "explanation": string
}`;

    const model = this.genAI.getGenerativeModel({
      model: this.geminiModel,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    let lastError = '';
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await model.generateContent([
          'Image 1:',
          { inlineData: { data: imgA.base64, mimeType: imgA.mimeType } },
          'Image 2:',
          { inlineData: { data: imgB.base64, mimeType: imgB.mimeType } },
          prompt,
        ]);

        const rawText = res.response.text();
        let parsed: unknown;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          return { output: null, error: 'Malformed JSON from Gemini model', status: 'MALFORMED_RESPONSE' };
        }

        const validated = VisualComparisonSchema.safeParse(parsed);
        if (!validated.success) {
          return {
            output: null,
            error: `Schema validation failed: ${validated.error.message}`,
            status: 'MALFORMED_RESPONSE',
          };
        }

        return { output: validated.data, status: 'SUCCESS' };
      } catch (err: any) {
        lastError = sanitizeString(err?.message || 'Unknown API error');
        // Transient error check (429 rate limit or 503 unavailable)
        const isTransient = /429|503|ResourceExhausted|Unavailable/i.test(lastError);
        if (isTransient && attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        break;
      }
    }

    return { output: null, error: lastError, status: 'API_ERROR' };
  }

  /**
   * Evaluates a candidate pair of complaints without altering any production data.
   * Can accept mocked visual result for offline tests.
   */
  public async evaluateCandidatePair(
    repA: ComplaintCandidateInput,
    repB: ComplaintCandidateInput,
    mockVisualResult?: { output: VisualComparisonOutput | null; status: ShadowEvaluationRecord['status']; error?: string }
  ): Promise<ShadowEvaluationRecord> {
    const t0 = Date.now();
    const evalId = `shadow-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Kill-switch check
    if (!this.enabled) {
      return {
        id: evalId,
        evaluatedAt: new Date().toISOString(),
        complaintCodeA: repA.code,
        complaintCodeB: repB.code,
        baselineDecision: 'SEPARATE',
        baselineScore: 0,
        breakdown: { semanticScore: 0, locationScore: 0, timeScore: 0, categoryScore: 0 },
        shadowRecommendation: 'SKIPPED',
        visualScore: null,
        visualUncertainty: null,
        rationale: 'Shadow fusion worker is strictly DISABLED by configuration.',
        latencyMs: 0,
        modelVersion: this.geminiModel,
        status: 'DISABLED',
      };
    }

    // 2. Production Baseline Gates & Scores (preserving identical production rules)
    const categoryScore = calculateCategoryScore(repA.category, repB.category);
    const distanceKm = calculateDistanceKm(repA.latitude, repA.longitude, repB.latitude, repB.longitude);
    const timeA = new Date(repA.createdAt);
    const timeB = new Date(repB.createdAt);
    const diffHours = Math.abs(timeA.getTime() - timeB.getTime()) / (1000 * 60 * 60);

    // Hard Gates Check
    let baselineDecision: FusionDecision = 'SEPARATE';
    let compositeScore = 0;
    let semanticScore = 0;
    let locationScore = 0;
    let timeScore = 0;

    const failedHardGate =
      categoryScore === 0 ||
      distanceKm > ENV.FUSION_MAX_DISTANCE_KM ||
      diffHours >= ENV.FUSION_MAX_TIME_HOURS;

    if (!failedHardGate) {
      locationScore = calculateLocationScore(distanceKm, ENV.FUSION_MAX_DISTANCE_KM);
      timeScore = calculateTimeScore(timeA, timeB, ENV.FUSION_MAX_TIME_HOURS);
      semanticScore = calculateTextSimilarity(repA.description, repB.description);

      compositeScore = parseFloat(
        (
          semanticScore * 0.35 +
          locationScore * 0.35 +
          timeScore * 0.15 +
          categoryScore * 0.15
        ).toFixed(3)
      );

      if (compositeScore >= ENV.FUSION_AUTO_MERGE_THRESHOLD) {
        baselineDecision = 'AUTO_MERGE';
      } else if (compositeScore >= ENV.FUSION_REVIEW_THRESHOLD) {
        baselineDecision = 'REVIEW';
      } else {
        baselineDecision = 'SEPARATE';
      }
    }

    // If hard gates failed, vision cannot override physical bounds
    if (failedHardGate) {
      const record: ShadowEvaluationRecord = {
        id: evalId,
        evaluatedAt: new Date().toISOString(),
        complaintCodeA: repA.code,
        complaintCodeB: repB.code,
        baselineDecision: 'SEPARATE',
        baselineScore: 0,
        breakdown: { semanticScore: 0, locationScore: 0, timeScore: 0, categoryScore },
        shadowRecommendation: 'DEMOTE_SEPARATE',
        visualScore: null,
        visualUncertainty: null,
        rationale: 'Hard physical, temporal, or category gates failed; vision evaluation bypassed.',
        latencyMs: Date.now() - t0,
        modelVersion: this.geminiModel,
        status: 'SKIPPED',
      };
      this.appendToLocalLog(record);
      return record;
    }

    // 3. Obtain Visual Evidence
    let visualResult: { output: VisualComparisonOutput | null; status: ShadowEvaluationRecord['status']; error?: string };

    if (mockVisualResult) {
      visualResult = mockVisualResult;
    } else {
      if (!repA.imageUrl || !repB.imageUrl) {
        visualResult = { output: null, status: 'SKIPPED', error: 'Missing image URL on one or both reports' };
      } else {
        const [imgA, imgB] = await Promise.all([
          this.fetchImageSafe(repA.imageUrl),
          this.fetchImageSafe(repB.imageUrl),
        ]);

        if (!imgA || !imgB) {
          visualResult = { output: null, status: 'SKIPPED', error: 'One or both images could not be downloaded' };
        } else {
          visualResult = await this.executeVisualComparison(repA, repB, imgA, imgB);
        }
      }
    }

    // 4. Formulate Shadow Recommendation (without applying any change to production)
    let recommendation: ShadowRecommendation = 'MAINTAIN_REVIEW';
    let rationale = 'Baseline review maintained; visual signals absent or neutral.';

    if (visualResult.status === 'SUCCESS' && visualResult.output) {
      const vis = visualResult.output;
      if (baselineDecision === 'REVIEW') {
        if (vis.couldBeSamePhysicalIncident && vis.visualSimilarityScore >= 0.80 && vis.uncertaintyLevel !== 'HIGH') {
          recommendation = 'CONFIRM_MERGE';
          rationale = `High visual confidence (${(vis.visualSimilarityScore * 100).toFixed(0)}%) confirms identical site. ${vis.explanation}`;
        } else if (!vis.couldBeSamePhysicalIncident && vis.visualSimilarityScore < 0.35 && vis.uncertaintyLevel === 'LOW') {
          recommendation = 'DEMOTE_SEPARATE';
          rationale = `Low visual similarity (${(vis.visualSimilarityScore * 100).toFixed(0)}%) confirms distinct sites. ${vis.explanation}`;
        } else {
          recommendation = 'MAINTAIN_REVIEW';
          rationale = `Visual evidence inconclusive (${(vis.visualSimilarityScore * 100).toFixed(0)}%, ${vis.uncertaintyLevel} uncertainty). Maintaining human review.`;
        }
      } else if (baselineDecision === 'AUTO_MERGE') {
        if (!vis.couldBeSamePhysicalIncident && vis.visualSimilarityScore < 0.40 && vis.uncertaintyLevel === 'LOW') {
          recommendation = 'DEMOTE_SEPARATE';
          rationale = `Visual veto: model detected distinct physical landmarks (${(vis.visualSimilarityScore * 100).toFixed(0)}%).`;
        } else {
          recommendation = 'CONFIRM_MERGE';
          rationale = 'Baseline auto-merge confirmed with consistent visual cues.';
        }
      } else {
        recommendation = 'DEMOTE_SEPARATE';
        rationale = 'Baseline separate confirmed.';
      }
    } else if (visualResult.status === 'SKIPPED') {
      recommendation = baselineDecision === 'AUTO_MERGE' ? 'CONFIRM_MERGE' : (baselineDecision === 'REVIEW' ? 'MAINTAIN_REVIEW' : 'DEMOTE_SEPARATE');
      rationale = `Imagery unavailable (${visualResult.error || 'skipped'}); safely fell back to baseline decision.`;
    } else {
      recommendation = baselineDecision === 'AUTO_MERGE' ? 'CONFIRM_MERGE' : (baselineDecision === 'REVIEW' ? 'MAINTAIN_REVIEW' : 'DEMOTE_SEPARATE');
      rationale = `Visual evaluation encountered ${visualResult.status} (${sanitizeString(visualResult.error || 'error')}); safely fell back to baseline.`;
    }

    const record: ShadowEvaluationRecord = {
      id: evalId,
      evaluatedAt: new Date().toISOString(),
      complaintCodeA: repA.code,
      complaintCodeB: repB.code,
      baselineDecision,
      baselineScore: compositeScore,
      breakdown: { semanticScore, locationScore, timeScore, categoryScore },
      shadowRecommendation: recommendation,
      visualScore: visualResult.output?.visualSimilarityScore ?? null,
      visualUncertainty: visualResult.output?.uncertaintyLevel ?? null,
      rationale: sanitizeString(rationale),
      latencyMs: Date.now() - t0,
      modelVersion: this.geminiModel,
      status: visualResult.status,
      errorDetails: visualResult.error ? sanitizeString(visualResult.error) : null,
    };

    // Strictly append to local JSONL; zero writes to Supabase
    this.appendToLocalLog(record);

    return record;
  }
}
