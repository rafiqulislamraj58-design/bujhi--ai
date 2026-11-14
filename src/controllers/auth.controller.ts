import type { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';

// 🚀 1. GOOGLE AUTH CALLBACK (REDIRECT TO HOME PAGE)
export const googleAuthCallback = (req: Request, res: Response): void => {
    const clientUrl = process.env.CLIENT_URL || 'https://buji-ai-frontend.vercel.app';

    res.redirect(`${clientUrl}/`); 
};

// 🚀 2. FETCH CLIENT
export const getMe = (req: Request, res: Response): void => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        return;
    }
    res.status(200).json({ success: true, user: req.user });
};

// 🚀 3. LOGOUT SESSION (IMPROVED & TYPESCRIPT FIXED)
export const logout = (req: Request, res: Response, next: NextFunction): void => {
    // 🚀 FIX: এখানে err এর সাথে `: any` বসিয়েছি
    req.logout((err: any) => {
        if (err) return next(err);
        
        // 🚀 FIX: এখানে destroyErr এর সাথে `: any` বসিয়েছি
        req.session.destroy((destroyErr: any) => {
            if (destroyErr) {
                console.error("Session destroy error:", destroyErr);
                return next(destroyErr);
            }
            
            res.clearCookie('connect.sid', { path: '/' }); 
            res.status(200).json({ success: true, message: 'Logged out successfully! 👋' });
        });
    });
};

// 🚀 4. UPDATE ACADEMIC PROFILE (IMPROVED)
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = (req.user as any)?._id; 

        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized: User ID not found' });
            return;
        }
        
        const { institution, class: studentClass, group, studyMedium } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'academic.institution': institution,
                    'academic.class': studentClass,
                    'academic.group': group,
                    'academic.studyMedium': studyMedium,
                    status: 'active' 
                }
            },
            { new: true, runValidators: true } 
        );

        if (!updatedUser) {
            res.status(404).json({ success: false, message: 'User not found in database' });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: updatedUser
        });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: error.message || 'Internal Server Error' }); 
    }
};