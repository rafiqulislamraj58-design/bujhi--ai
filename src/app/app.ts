import express, { type Application, type Request, type Response, type NextFunction } from 'express';
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

// 🚀 Nuclear CORS Option (Custom Middleware) - No more 'cors' package needed!
app.use((req: Request, res: Response, next: NextFunction): void => {
    const allowedOrigins = ['http://localhost:3000', 'https://bujhi-ai-2.onrender.com'];
    const origin = req.headers.origin as string;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    // Preflight (OPTIONS) রিকোয়েস্ট আসলে সাথে সাথে 200 OK রেসপন্স দিয়ে বিদায় করো
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
});

// 🚀 Trust Proxy for Render Cookies
app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('🚀 Bujhi AI Server is Running Successfully!');
});

// 🚀 Session Setup 
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