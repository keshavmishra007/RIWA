import path from 'path';
import { ShadowFusionWorker, ComplaintCandidateInput } from '../workers/shadowFusionWorker.js';
import { db } from '../db/store.js';
import { ENV } from '../config/env.js';
import { calculateCategoryScore, calculateDistanceKm } from '../services/fusionEngine.js';

/**
 * Standalone Manual Evaluation Worker for Shadow Vision Clustering
 * 
 * Usage:
 *   npx tsx src/scripts/runShadowWorker.ts [--force] [CODE_A CODE_B]
 *
 * Examples:
 *   npx tsx src/scripts/runShadowWorker.ts --force
 *   npx tsx src/scripts/runShadowWorker.ts --force R-298 R-600
 *
 * NOTE:
 * Defaults to DISABLED. Does not execute unless SHADOW_FUSION_ENABLED=true
 * or --force flag is explicitly passed by an authorized operator.
 */
async function main() {
  const args = process.argv.slice(2);
  const forceFlag = args.includes('--force');
  const positionalCodes = args.filter((arg) => !arg.startsWith('--'));

  console.log('========================================================================');
  console.log('             RiWA STANDALONE SHADOW FUSION WORKER');
  console.log('========================================================================');

  const isEnabled = ENV.SHADOW_FUSION_ENABLED || forceFlag;

  if (!isEnabled) {
    console.log('\n🔒 STATUS: SHADOW WORKER IS DISABLED.');
    console.log('   Configuration check: SHADOW_FUSION_ENABLED is false or unset.');
    console.log('   To safely run a dry-run evaluation:');
    console.log('     npx tsx src/scripts/runShadowWorker.ts --force\n');
    console.log('Zero evaluations performed. Exiting safely without actions.\n');
    process.exit(0);
  }

  console.log(`\n🚀 Initializing worker with model: ${ENV.GEMINI_MODEL}`);
  console.log(`📁 Local Output Destination: ${path.resolve(process.cwd(), ENV.SHADOW_OUTPUT_DIR, 'evaluations.jsonl')}`);
  console.log(`🔒 Write Isolation: LOCAL FILE ONLY (0 writes to Supabase database)\n`);

  const worker = new ShadowFusionWorker({ enabled: true });

  console.log('Fetching complaints from database (read-only)...');
  const complaints = await db.getAllComplaints();
  console.log(`Loaded ${complaints.length} complaints from database.\n`);

  const candidatePairs: Array<[ComplaintCandidateInput, ComplaintCandidateInput]> = [];

  if (positionalCodes.length >= 2) {
    // Specific pair requested via CLI
    const codeA = positionalCodes[0].toUpperCase();
    const codeB = positionalCodes[1].toUpperCase();

    const compA = complaints.find(
      (c) => c.complaintCode?.toUpperCase() === codeA || c.id === codeA
    );
    const compB = complaints.find(
      (c) => c.complaintCode?.toUpperCase() === codeB || c.id === codeB
    );

    if (!compA || !compB) {
      console.error(`❌ Error: Could not find both reports in database (${codeA}, ${codeB}).`);
      process.exit(1);
    }

    candidatePairs.push([
      {
        id: compA.id,
        code: compA.complaintCode || compA.id,
        description: compA.description,
        category: compA.category,
        latitude: compA.latitude,
        longitude: compA.longitude,
        createdAt: compA.createdAt,
        imageUrl: compA.imageUrl,
      },
      {
        id: compB.id,
        code: compB.complaintCode || compB.id,
        description: compB.description,
        category: compB.category,
        latitude: compB.latitude,
        longitude: compB.longitude,
        createdAt: compB.createdAt,
        imageUrl: compB.imageUrl,
      },
    ]);
  } else {
    // Automatically retrieve candidate pairs that meet distance and category eligibility
    for (let i = 0; i < complaints.length; i++) {
      for (let j = i + 1; j < complaints.length; j++) {
        const cA = complaints[i];
        const cB = complaints[j];

        // Spatial pre-filter: within 2x distance limit
        const distKm = calculateDistanceKm(cA.latitude, cA.longitude, cB.latitude, cB.longitude);
        if (distKm > ENV.FUSION_MAX_DISTANCE_KM * 2) continue;

        // Category pre-filter
        const catScore = calculateCategoryScore(cA.category, cB.category);
        if (catScore === 0) continue;

        candidatePairs.push([
          {
            id: cA.id,
            code: cA.complaintCode || cA.id,
            description: cA.description,
            category: cA.category,
            latitude: cA.latitude,
            longitude: cA.longitude,
            createdAt: cA.createdAt,
            imageUrl: cA.imageUrl,
          },
          {
            id: cB.id,
            code: cB.complaintCode || cB.id,
            description: cB.description,
            category: cB.category,
            latitude: cB.latitude,
            longitude: cB.longitude,
            createdAt: cB.createdAt,
            imageUrl: cB.imageUrl,
          },
        ]);
      }
    }
  }

  console.log(`Identified ${candidatePairs.length} candidate pairs for shadow evaluation.\n`);

  let processed = 0;
  let confirmMerge = 0;
  let demoteSeparate = 0;
  let maintainReview = 0;
  let skipped = 0;

  for (const [repA, repB] of candidatePairs) {
    const result = await worker.evaluateCandidatePair(repA, repB);
    processed++;

    if (result.shadowRecommendation === 'CONFIRM_MERGE') confirmMerge++;
    else if (result.shadowRecommendation === 'DEMOTE_SEPARATE') demoteSeparate++;
    else if (result.shadowRecommendation === 'MAINTAIN_REVIEW') maintainReview++;
    else skipped++;

    console.log(
      `[PAIR] ${repA.code} vs ${repB.code} | Base: ${result.baselineDecision} (${(result.baselineScore * 100).toFixed(0)}%) -> Shadow: ${result.shadowRecommendation} (${result.status})`
    );
  }

  console.log('\n========================================================================');
  console.log('                   EVALUATION SUMMARY');
  console.log('========================================================================');
  console.log(`Total Pairs Evaluated:   ${processed}`);
  console.log(`CONFIRM_MERGE:           ${confirmMerge}`);
  console.log(`DEMOTE_SEPARATE:         ${demoteSeparate}`);
  console.log(`MAINTAIN_REVIEW:         ${maintainReview}`);
  console.log(`SKIPPED (no image/gate): ${skipped}`);
  console.log(`\nOutput appended to: ${worker.getOutputFilePath()}`);
  console.log('Production database state: 100% UNTOUCHED (Zero mutations).\n');
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
