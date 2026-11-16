import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import employeeRoutes from './routes/employeeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is healthy' }));
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 5000;

console.log('MongoDB URI loaded:', Boolean(process.env.MONGO_URI));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!');

        app.listen(PORT, () => {
            console.log(`API running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection failed!');
        console.error(error.message);
        process.exit(1);
    });