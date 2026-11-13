import type { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js'; // <-- 

// GOOGLE AUTH CALLBACK
export const googleAuthCallback = (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Google Login Successful! 🚀',
        user: req.user
    });
};

// FETCH CLIENT
export const getMe = (req: Request, res: Response): void => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        return;
    }
    res.status(200).json({ success: true, user: req.user });
};

// LOGOUT SESSION
export const logout = (req: Request, res: Response, next: NextFunction): void => {
    req.logout((err) => {
        if (err) return next(err);
        
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); //
            res.status(200).json({ success: true, message: 'Logged out successfully! 👋' });
        });
    });
};

// UPDATE ACADEMIC PROFILE
export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // req.user 
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

        // 
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
        res.status(500).json({ success: false, message: error.message || 'Internal Server Error' }); 
    }
};