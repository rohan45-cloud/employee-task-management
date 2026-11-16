import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import employeeRoutes from './routes/employeeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import {
    notFound,
    errorHandler
} from './middleware/errorMiddleware.js';

const app = express();

// ===============================
// 1. CORS CONFIGURATION
// ===============================

const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header (e.g. Postman)
            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/$/, '');

            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }

            console.log('CORS blocked origin:', origin);
            return callback(new Error('Not allowed by CORS'));
        },
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })
);

// ===============================
// 2. MIDDLEWARE
// ===============================

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// ===============================
// 3. HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is healthy'
    });
});

// ===============================
// 4. API ROUTES
// ===============================

app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ===============================
// 5. ERROR HANDLING
// ===============================

app.use(notFound);
app.use(errorHandler);

// ===============================
// 6. DATABASE CONNECTION
// ===============================

const PORT = process.env.PORT || 5000;

const startServer = async() => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in environment variables');
        }

        console.log('Connecting to MongoDB...');

        await mongoose.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully!');

        app.listen(PORT, () => {
            console.log(`API running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();