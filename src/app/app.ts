import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from '../config/passport.js';
import authRoutes from '../routes/auth.routes.js';
import { connectDB } from '../config/db.js';
import academicRoutes from '../routes/academic.routes.js';
import aiRoutes from '../routes/ai.routes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

// 🚀 1. Bulletproof CORS Configuration (Single & Clean)
const corsOptions = {
    origin: function (origin: any, callback: any) {
        // Allow ALL origins to bypass CORS completely
        callback(null, true);
    },
    credentials: true, // Session cookie allow
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('/(.*)', cors(corsOptions)); // Handle Preflight for all routes

// 
app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => {
    res.status(200).send('🚀 Bujhi AI Server is Running Successfully!');
});

// 🚀 3. Session Setup 
app.use(session({
    secret: process.env.SESSION_SECRET || 'bujhi_ai_super_secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI as string,
        collectionName: 'sessions' 
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 Day
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 🚀 Cross-origin 
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/academic', academicRoutes);

app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

export default app;