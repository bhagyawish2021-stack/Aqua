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


const app = express();

// ─── Render / Proxy Configuration ────────────────────────────────────────────
// Required because Render uses a reverse proxy and sends X-Forwarded-For headers.
app.set('trust proxy', 1);


// ─── Security & CORS ─────────────────────────────────────────────────────────

app.use(
  cors({
    origin: config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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