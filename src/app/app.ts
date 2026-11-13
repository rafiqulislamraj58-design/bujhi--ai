import express, { type Application, type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from '../config/passport.js';
import authRoutes from '../routes/auth.routes.js';
import { connectDB } from '../config/db.js'; // .js extension due to nodenext module resolution
import academicRoutes from '../routes/academic.routes.js';
import aiRoutes from '../routes/ai.routes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();


// 🚀 Bulletproof CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
       
        callback(null, true);
    },
    credentials: true, // Session cookie 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
const corsOptions = {
    origin: ['http://localhost:3000', 'https://bujhi-ai-2.onrender.com'], 
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 
app.get('/', (req, res) => {
    res.status(200).send('🚀 Bujhi AI Server is Running Successfully!');
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session Setup[cite: 3, 4]
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
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    }
}));

// Initialize Passport[cite: 3]
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