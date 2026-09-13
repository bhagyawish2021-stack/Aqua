'use strict';

const express = require('express');

const cors = require('cors');

const { config } = require('./config/env');

const logger = require('./middleware/logger');

const { generalLimiter } = require('./middleware/rateLimiter');

const {
  notFoundHandler,
  globalErrorHandler
} = require('./middleware/errorHandler');

// Route imports

const healthRoutes = require('./routes/health.routes');

const authRoutes = require('./routes/auth.routes');

const profileRoutes = require('./routes/profile.routes');

const pondRoutes = require('./routes/pond.routes');

const waterQualityRoutes = require('./routes/waterQuality.routes');

const feedRoutes = require('./routes/feed.routes');

const growthRoutes = require('./routes/growth.routes');

const businessRoutes = require('./routes/business.routes');

const mlRoutes = require('./routes/ml.routes');

const aiRoutes = require('./routes/ai.routes');

const marketRoutes = require('./routes/market.routes');

const jobsRoutes = require('./routes/jobs.routes');

const equipmentRoutes = require('./routes/equipment.routes');

const hatcheryRoutes = require('./routes/hatchery.routes');

const diseaseRoutes = require('./routes/disease.routes');

const preventionRoutes = require('./routes/prevention.routes');

const consultationRoutes = require('./routes/expertConsultation.routes');

const suppliesRoutes = require('./routes/supplies.routes');

const seafoodRoutes = require('./routes/seafood.routes');

const dashboardRoutes = require('./routes/dashboard.routes');


const app = express();

// ─── Render / Proxy Configuration ────────────────────────────────────────────
// Required because Render uses a reverse proxy and sends X-Forwarded-For headers.
app.set('trust proxy', 1);


// ─── Security & CORS ─────────────────────────────────────────────────────────

// Standard security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const allowedOrigins = (config.frontendUrl || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        allowedOrigins.includes('*') ||
        config.isDev ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);


// ─── Body Parsing ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);


// ─── Request Logging ─────────────────────────────────────────────────────────

app.use(logger);


// ─── Rate Limiting ───────────────────────────────────────────────────────────

app.use('/api', generalLimiter);


// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/health', healthRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/profile', profileRoutes);

app.use('/api/ponds', pondRoutes);


// Nested pond sub-routes

app.use(
  '/api/ponds/:pondId/water-quality',
  waterQualityRoutes
);

app.use(
  '/api/ponds/:pondId/feed',
  feedRoutes
);

app.use(
  '/api/ponds/:pondId/growth',
  growthRoutes
);

app.use(
  '/api/ponds/:pondId/business',
  businessRoutes
);


// ─── ML & AI ─────────────────────────────────────────────────────────────────

app.use('/api/ml', mlRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/market', marketRoutes);

app.use('/api/jobs', jobsRoutes);

app.use('/api/equipment', equipmentRoutes);

app.use('/api/hatcheries', hatcheryRoutes);

app.use('/api/disease', diseaseRoutes);

app.use('/api/prevention', preventionRoutes);

app.use('/api/consultations', consultationRoutes);

app.use('/api/supplies', suppliesRoutes);

app.use('/api/seafood', seafoodRoutes);

app.use('/api/dashboard', dashboardRoutes);


// ─── Root Route ──────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AquaMitra API 🦐',
    docs: '/api/health',
  });
});


// ─── Error Handling (must be last) ───────────────────────────────────────────

app.use(notFoundHandler);

app.use(globalErrorHandler);


module.exports = app;