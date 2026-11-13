import { Router } from 'express';
import passport from 'passport';
import { googleAuthCallback, getMe, logout ,updateProfile } from '../controllers/auth.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/api/v1/health' }),
    googleAuthCallback
);

// GET 
router.get('/me', isAuthenticated, getMe);
// post
router.post('/logout', isAuthenticated, logout);
// put
router.put('/update-profile', isAuthenticated, updateProfile);

export default router;