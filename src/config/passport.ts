import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js'; 
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: '/api/v1/auth/google/callback'
}, 

async (accessToken: any, refreshToken: any, profile: any, done: any) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.create({
                googleId: profile.id,
                email: profile.emails?.[0]?.value || "",
                displayName: profile.displayName || "Unknown User",
                avatarUrl: profile.photos?.[0]?.value || "",
            } as any); 
        }
        return done(null, user);
    } catch (error) {
        return done(error as Error, undefined);
    }
}));


passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
});


passport.deserializeUser(async (id: any, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;