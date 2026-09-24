import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import addressRoutes from './src/routes/addressRoutes.js';
import customerRoutes from './src/routes/customerRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

// Connect MongoDB Database
connectDB();

const app = express();

// Middlewares — CORS: allow all local dev origins + wildcard for prod
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, Postman) or from localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168.')) {
      callback(null, true);
    } else {
      callback(null, true); // Also allow in production (Vercel, etc)
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// Health Check API Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Fresh Tokri Backend API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', customerRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Fresh Tokri Backend] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
