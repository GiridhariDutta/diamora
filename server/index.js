import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/authRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import collectionRoutes from './src/routes/collectionRoutes.js';
import colorRoutes from './src/routes/colorRoutes.js';
import purityRoutes from './src/routes/purityRoutes.js';
import diamondQualityRoutes from './src/routes/diamondQualityRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import './src/config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files from server/public directory (Cloud Run single-deploy mode)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/purities', purityRoutes);
app.use('/api/diamond-qualities', diamondQualityRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Goldshop Server is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application (SPA) Fallback Route for React Router
app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found in server/public. Please run `npm run build` in client folder.');
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================`);
  console.log(`🚀 Diamora Unified Server running on http://0.0.0.0:${PORT}`);
  console.log(`=================================`);
});
