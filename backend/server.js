import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/pool.js';
import csvRoutes from './routes/csv.js';
import gsmRoutes from './routes/gsm.js';
import lteRoutes from './routes/lte.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import lteFrequencyRoutes from './routes/lteFrequency.js';
import lteKpiRoutes from './routes/lteKpi.js';
import nrRoutes from './routes/nr.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'KPI Reports API - Kosovo Telecom' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// CSV Upload routes (generic)
app.use('/api/csv', csvRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Users management routes
app.use('/api/users', usersRoutes);

// GSM KPI routes
app.use('/api/gsm', gsmRoutes);

// LTE traffic routes
app.use('/api/lte', lteRoutes);

// LTE frequency data routes
app.use('/api/lte-frequency', lteFrequencyRoutes);

// LTE KPI routes
app.use('/api/lte-kpi', lteKpiRoutes);

// NR (5G) KPI routes
app.use('/api/nr', nrRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
