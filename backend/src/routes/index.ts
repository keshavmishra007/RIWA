import { Router } from 'express';
import analyticsRoutes from './analyticsRoutes.js';
import authRoutes from './authRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import hotspotRoutes from './hotspotRoutes.js';
import incidentRoutes from './incidentRoutes.js';
import reportRoutes from './reportRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/incidents', incidentRoutes);
apiRouter.use('/hotspots', hotspotRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/departments', departmentRoutes);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'RIWA Civic Intelligence API',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
