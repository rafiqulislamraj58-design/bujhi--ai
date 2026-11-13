import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    googleId: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    role: 'Student' | 'Content Reviewer' | 'Admin' | 'Super Admin';
    status: 'active' | 'suspended';
    academicProfile?: {
        level?: string; // e.g., SSC, HSC
        group?: string; // e.g., Science
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String },
    role: {
        type: String,
        enum: ['Student', 'Content Reviewer', 'Admin', 'Super Admin'],
        default: 'Student' // Default role for new signups
    },
    status: { 
        type: String, 
        enum: ['active', 'suspended'], 
        default: 'active' 
    },
    academicProfile: {
        level: { type: String },
        group: { type: String }
    }
}, { 
    timestamps: true 
});

export default mongoose.model<IUser>('User', UserSchema);