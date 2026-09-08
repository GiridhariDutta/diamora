import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import collectionRoutes from './src/routes/collectionRoutes.js';
import colorRoutes from './src/routes/colorRoutes.js';
import purityRoutes from './src/routes/purityRoutes.js';
import diamondQualityRoutes from './src/routes/diamondQualityRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import './src/config/firebase.js';

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/purities', purityRoutes);
app.use('/api/diamond-qualities', diamondQualityRoutes);
app.use('/api/products', productRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Goldshop Server is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Goldshop Server running on http://localhost:${PORT}`);
  console.log(`=================================`);
});
