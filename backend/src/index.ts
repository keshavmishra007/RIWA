import path from 'path';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';

const app = express();

// CORS configuration supporting local dev and Vercel production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
];

if (ENV.FRONTEND_URL) {
  ENV.FRONTEND_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, health checkers)
      if (!origin) return callback(null, true);
      // Allow configured origins or any *.vercel.app deployment
      if (
        allowedOrigins.includes(origin) ||
        ENV.NODE_ENV !== 'production' ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static serving for locally uploaded evidence files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint (both /health and /api/health supported)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'RiWA Civic Intelligence API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRouter);

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'RiWA — Rewa Intelligence for Work and Action API',
    descriptor: 'AI-Powered Civic Incident Intelligence Platform',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      auth: '/api/auth',
      reports: '/api/reports',
      incidents: '/api/incidents',
      hotspots: '/api/hotspots',
      analytics: '/api/analytics/overview',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = ENV.PORT;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(`🚀 RiWA Backend running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${ENV.NODE_ENV}`);
  console.log(`🔗 API Base: http://${HOST}:${PORT}/api`);
  console.log('====================================================');
});

export default app;
