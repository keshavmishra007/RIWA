import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV, isGeminiConfigured } from '../config/env.js';

const genAI = isGeminiConfigured() ? new GoogleGenerativeAI(ENV.GEMINI_API_KEY) : null;

export const generateEmbedding = async (text: string): Promise<number[] | null> => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: ENV.GEMINI_EMBEDDING_MODEL });
      const result = await model.embedContent(text);
      console.log(`📐 [Embedding Engine] Generated real vector embedding (${result.embedding.values.length} dims) via ${ENV.GEMINI_EMBEDDING_MODEL}`);
      return result.embedding.values;
    } catch (error: any) {
      console.warn(`⚠️ [Embedding Engine] Gemini embedding failed (${error?.message || error}). Explicitly falling back to text similarity.`);
    }
  } else {
    console.warn('⚠️ [Embedding Engine] Gemini API key not configured.');
  }
  return null;
};

// Cosine similarity for two vectors
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return Math.max(0, Math.min(1, dotProduct / denominator));
};

// Fallback text overlap similarity (Jaccard + Hinglish normalization + common civic keyword weighting)
export const calculateTextSimilarity = (textA: string, textB: string): number => {
  const normalizeHinglish = (t: string) =>
    t
      .toLowerCase()
      .replace(/\bgadhe\b|\bgaddhe\b|\bgaddha\b|\bgadha\b/g, 'pothole')
      .replace(/\bkachra\b|\bkooda\b|\bkuda\b|\bpolyethene\b|\bpolyethenes\b/g, 'garbage')
      .replace(/\bchauraha\b|\bchaurahaa\b|\bchouk\b|\bchowk\b/g, 'intersection')
      .replace(/\bnaali\b|\bnali\b|\bgutter\b|\bkeechad\b|\bkichad\b/g, 'drain')
      .replace(/\bbijli\b|\btaar\b|\btar\b/g, 'wire');

  const tokenize = (t: string) =>
    normalizeHinglish(t)
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const wordsA = new Set(tokenize(textA));
  const wordsB = new Set(tokenize(textB));

  if (!wordsA.size || !wordsB.size) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  const jaccard = union > 0 ? intersection / union : 0;

  // Scale up slightly for realistic conversational civic complaints
  return Math.min(1.0, 0.4 + jaccard * 0.6);
};
