// app.js — Express app WITHOUT server.listen()
// Shared by: Vercel (api/index.js) AND Azure/local (backend/src/server.js)
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { securityHeaders, corsMiddleware, generalLimiter, errorHandler } from './middleware/security.middleware.js';
import authRoutes     from './routes/auth.routes.js';
import usersRoutes    from './routes/users.routes.js';
import { companiesRouter, avatarsRouter, jobsRouter, creditsRouter } from './routes/resources.routes.js';
import generateRoutes from './routes/generate.routes.js';
import paymentsRoutes from './routes/payments.routes.js';

const app = express();

app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(generalLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health',     (req, res) => res.json({ status: 'ok', platform: process.env.PLATFORM || 'unknown', ts: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', platform: process.env.PLATFORM || 'unknown', ts: new Date().toISOString() }));

// API Routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     usersRoutes);
app.use('/api/companies', companiesRouter);
app.use('/api/avatars',   avatarsRouter);
app.use('/api/jobs',      jobsRouter);
app.use('/api/credits',   creditsRouter);
app.use('/api/generate',  generateRoutes);
app.use('/api/payments',  paymentsRoutes);

// 404 for unknown API routes
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// Global error handler (must be last)
app.use(errorHandler);

export default app;
