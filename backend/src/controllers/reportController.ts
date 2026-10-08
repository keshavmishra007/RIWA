import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { getSupabase } from '../config/supabase.js';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeCitizenReport, generateIncidentBrief } from '../services/aiService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { evaluateFusion } from '../services/fusionEngine.js';
import { evaluatePriority } from '../services/priorityEngine.js';
import { JWTPayload } from '../types/index.js';

export const submitReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // 1. Validate request
    const { description, latitude, longitude, imageUrl, categoryOverride } = req.body;

    if (!description || latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Description and location (latitude, longitude) are required.' });
      return;
    }

    // 2. Determine authenticated / valid user UUID
    let userId: string | null = req.user?.userId || null;
    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
          userId = decoded.userId;
        } catch {
          // Token invalid or expired, continue to fallback
        }
      }
    }

    if (!userId) {
      // Find the seeded demo citizen's real UUID in Supabase
      const demoCitizen = await db.findUserByEmail('citizen@riwa.demo');
      userId = demoCitizen ? demoCitizen.id : null;
    }

    const reportCode = `R-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Create complaint record first to establish real UUID
    const savedComplaint = await db.createComplaint({
      complaintCode: reportCode,
      userId: userId as any,
      description,
      rawText: description,
      imageUrl: imageUrl || null,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      category: categoryOverride || undefined,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    });

    // 4. Run AI analysis
    const aiAnalysis = await analyzeCitizenReport(description);
    const category = categoryOverride || aiAnalysis.category;

    // Update complaint with analyzed category
    await db.updateComplaint(savedComplaint.id, { category });

    // 5. Generate and store semantic embedding using complaint UUID
    const embedding = await generateEmbedding(description);

    await db.createAIAnalysis({
      complaintId: savedComplaint.id, // Real complaint UUID
      category: aiAnalysis.category,
      subcategory: aiAnalysis.subcategory,
      severity: aiAnalysis.severity,
      summary: aiAnalysis.summary,
      department: aiAnalysis.department,
      confidence: aiAnalysis.confidence,
      keywords: aiAnalysis.keywords,
      hazards: aiAnalysis.hazards,
      sensitiveLocations: aiAnalysis.sensitiveLocations,
      embedding,
    });

    // 6. Find candidate active incidents and attach their complaint embeddings
    const allIncidents = await db.getIncidents();
    const activeCandidates = allIncidents.filter(
      (inc) => inc.status !== 'RESOLVED' && inc.status !== 'CLOSED'
    );

    const candidatesWithEmbeddings = await Promise.all(
      activeCandidates.map(async (inc) => {
        const complaintEmbeddings = await db.getIncidentComplaintEmbeddings(inc.id);
        return {
          ...inc,
          complaintEmbeddings,
        };
      })
    );

    // 7. Calculate fusion signals
    const fusionResult = evaluateFusion({
      complaintCode: reportCode,
      description,
      category,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      createdAt: new Date(),
      embedding,
      candidateIncidents: candidatesWithEmbeddings,
    });

    let targetIncidentId: string;
    let isAutoMerged = false;

    // 8. Decide AUTO_MERGE / REVIEW / SEPARATE
    if (fusionResult.decision === 'AUTO_MERGE' && fusionResult.matchedIncidentId) {
      // AUTO-MERGE: Attach to existing incident
      const existingIncident = await db.getIncidentById(fusionResult.matchedIncidentId);
      if (!existingIncident) {
        throw new Error('Matched incident not found in database.');
      }

      isAutoMerged = true;
      targetIncidentId = existingIncident.id;
      const newReportCount = existingIncident.reportCount + 1;

      // Re-evaluate Priority & Trend
      const priorityEval = evaluatePriority({
        baseSeverity: aiAnalysis.severity,
        category,
        reportCount: newReportCount,
        hazards: aiAnalysis.hazards,
        sensitiveLocations: aiAnalysis.sensitiveLocations,
        recentReportsInLastHour: 3,
      });

      // Update Incident record with authentic fusion confidence
      await db.updateIncident(existingIncident.id, {
        reportCount: newReportCount,
        priority: priorityEval.priority,
        trend: priorityEval.trend,
        fusionConfidence: fusionResult.fusionScore,
      });

      // Link complaint to existing incident
      await db.updateComplaint(savedComplaint.id, {
        incidentId: existingIncident.id,
        status: 'IN_PROGRESS',
      });

      // 9. Create incident_reports association using real UUIDs
      await db.createIncidentReport({
        incidentId: existingIncident.id,
        complaintId: savedComplaint.id, // Real complaint UUID!
        fusionScore: fusionResult.fusionScore,
        semanticScore: fusionResult.semanticScore,
        locationScore: fusionResult.locationScore,
        timeScore: fusionResult.timeScore,
        categoryScore: fusionResult.categoryScore,
        createdAt: new Date().toISOString(),
      });

      await db.addStatusLog({
        incidentId: existingIncident.id,
        status: existingIncident.status,
        actorName: 'RIWA Fusion Engine',
        note: `Citizen report ${reportCode} auto-fused into incident (Confidence: ${(fusionResult.fusionScore * 100).toFixed(0)}%). Priority: ${priorityEval.priority}.`,
      });
    } else {
      // NEW INCIDENT CREATION (REVIEW or SEPARATE)
      const newIncidentNumber = Math.floor(100 + Math.random() * 900);
      const assignedIncidentCode = `INC-${newIncidentNumber}`;

      const title = `${aiAnalysis.subcategory.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} near ${aiAnalysis.sensitiveLocations[0] || 'Rewa Sector'}`;

      const briefData = await generateIncidentBrief(
        title,
        category,
        1,
        [description]
      );

      const priorityEval = evaluatePriority({
        baseSeverity: aiAnalysis.severity,
        category,
        reportCount: 1,
        hazards: aiAnalysis.hazards,
        sensitiveLocations: aiAnalysis.sensitiveLocations,
      });

      const newIncident = await db.createIncident({
        incidentCode: assignedIncidentCode,
        title,
        category,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        priority: priorityEval.priority,
        status: 'OPEN',
        fusionConfidence: aiAnalysis.confidence || 0.90,
        departmentName: aiAnalysis.department,
        summary: briefData.summary,
        aiBrief: briefData.aiBrief,
        recommendedActions: briefData.recommendedActions,
        reportCount: 1,
        areaKm: 0.2,
        trend: 'STABLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      targetIncidentId = newIncident.id;

      // Link complaint to new incident
      await db.updateComplaint(savedComplaint.id, {
        incidentId: newIncident.id,
        status: 'OPEN',
      });

      // Record founding incident_report association with real UUIDs
      await db.createIncidentReport({
        incidentId: newIncident.id,
        complaintId: savedComplaint.id, // Real complaint UUID!
        fusionScore: 1.0,
        semanticScore: 1.0,
        locationScore: 1.0,
        timeScore: 1.0,
        categoryScore: 1.0,
        createdAt: new Date().toISOString(),
      });

      const initNote =
        fusionResult.decision === 'REVIEW' && fusionResult.matchedIncidentId
          ? `Incident ${assignedIncidentCode} created (Review Band: ${(fusionResult.fusionScore * 100).toFixed(0)}% similarity with existing incident). Awaiting authority review.`
          : `Incident ${assignedIncidentCode} initialized from citizen report ${reportCode}. Classified as ${category}.`;

      await db.addStatusLog({
        incidentId: newIncident.id,
        status: 'OPEN',
        actorName: 'RIWA AI',
        note: initNote,
      });
    }

    const finalIncident = await db.getIncidentById(targetIncidentId);
    const updatedComplaint = await db.getComplaintById(savedComplaint.id);

    // 10. Return complete result to the frontend
    res.status(201).json({
      success: true,
      complaint: updatedComplaint || savedComplaint,
      incident: finalIncident,
      isAutoMerged,
      aiAnalysis,
      fusionResult,
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ error: 'Failed to process and fuse citizen report.' });
  }
};

export const getMyReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let userId = req.user?.userId;
    if (!userId) {
      const demoCitizen = await db.findUserByEmail('citizen@riwa.demo');
      userId = demoCitizen ? demoCitizen.id : '';
    }
    const reports = await db.getComplaintsByUser(String(userId || ''));
    res.json(reports);
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ error: 'Failed to fetch citizen reports.' });
  }
};

export const getReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const report = await db.getComplaintById(id);

    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    let linkedIncident = null;
    if (report.incidentId) {
      linkedIncident = await db.getIncidentById(report.incidentId);
    }

    res.json({
      report,
      incident: linkedIncident,
    });
  } catch (error) {
    console.error('Get report detail error:', error);
    res.status(500).json({ error: 'Failed to fetch report details.' });
  }
};

export const uploadReportImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image file uploaded. Please provide an image file in the "image" field.' });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const collisionSafeName = `evidence-${Date.now()}-${crypto.randomUUID()}${ext}`;
    const storagePath = collisionSafeName;

    const supabase = getSupabase();
    let imageUrl: string | null = null;
    let storageProvider: 'supabase' | 'local' = 'supabase';

    if (supabase) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-evidence')
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('report-evidence')
            .getPublicUrl(storagePath);
          imageUrl = urlData.publicUrl;
          console.log(`☁️ [Storage] Successfully uploaded evidence to Supabase Storage: ${imageUrl}`);
        } else {
          console.warn(`⚠️ [Storage] Supabase upload failed (${uploadError?.message}), using local fallback.`);
        }
      } catch (err: any) {
        console.warn('⚠️ [Storage] Exception during Supabase upload:', err.message);
      }
    }

    // Local fallback if Supabase Storage bucket is not yet provisioned
    if (!imageUrl) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, collisionSafeName);
      fs.writeFileSync(localFilePath, file.buffer);
      const host = req.get('host') || `localhost:${ENV.PORT}`;
      const protocol = req.protocol || 'http';
      imageUrl = `${protocol}://${host}/uploads/${collisionSafeName}`;
      storageProvider = 'local';
      console.log(`📁 [Storage] Saved evidence to local fallback: ${imageUrl}`);
    }

    res.status(201).json({
      success: true,
      imageUrl,
      fileName: collisionSafeName,
      storageProvider,
      size: file.size,
      mimetype: file.mimetype,
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to process and upload image.' });
  }
};

