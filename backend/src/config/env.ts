import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'riwa_civic_intelligence_jwt_secret_key_2026_rewa',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    '',

  // Gemini AI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',

  // Fusion Engine Parameters
  FUSION_AUTO_MERGE_THRESHOLD: parseFloat(process.env.FUSION_AUTO_MERGE_THRESHOLD || '0.85'),
  FUSION_REVIEW_THRESHOLD: parseFloat(process.env.FUSION_REVIEW_THRESHOLD || '0.65'),
  FUSION_MAX_DISTANCE_KM: parseFloat(process.env.FUSION_MAX_DISTANCE_KM || '0.5'),
  FUSION_MAX_TIME_HOURS: parseFloat(process.env.FUSION_MAX_TIME_HOURS || '48'),

  // Vision Shadow Mode (Strictly defaults to false; missing/empty/invalid evaluates to false)
  SHADOW_FUSION_ENABLED: process.env.SHADOW_FUSION_ENABLED === 'true',
  SHADOW_OUTPUT_DIR: process.env.SHADOW_OUTPUT_DIR || 'data/shadow',
};

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(ENV.SUPABASE_URL) &&
    !ENV.SUPABASE_URL.includes('your-project') &&
    Boolean(ENV.SUPABASE_SERVICE_ROLE_KEY) &&
    !ENV.SUPABASE_SERVICE_ROLE_KEY.includes('your-supabase')
  );
};

export const isGeminiConfigured = (): boolean => {
  return Boolean(ENV.GEMINI_API_KEY) && !ENV.GEMINI_API_KEY.includes('your-gemini');
};
