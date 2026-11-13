import mongoose, { Schema, Document } from 'mongoose';

// 1. Class Schema 
export interface IClass extends Document {
    name: string;
    level: 'School' | 'College' | 'University';
    isActive: boolean;
}

const classSchema = new Schema<IClass>({
    name: { type: String, required: true, unique: true }, // Class 9, HSC
    level: { type: String, enum: ['School', 'College', 'University'], required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Class = mongoose.model<IClass>('Class', classSchema);

// 2. Subject Schema 
export interface ISubject extends Document {
    name: string;
    classId: mongoose.Types.ObjectId; //
    description?: string;
    isActive: boolean;
}

const subjectSchema = new Schema<ISubject>({
    name: { type: String, required: true }, // Physics
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Subject = mongoose.model<ISubject>('Subject', subjectSchema);

// 3. Topic/Chapter Schema (যেমন: Motion, Force, Tense)
export interface ITopic extends Document {
    title: string;
    subjectId: mongoose.Types.ObjectId; 
    content?: string; 
    order: number; 
}

const topicSchema = new Schema<ITopic>({
    title: { type: String, required: true }, // Chapter 1: Motion
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    content: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

export const Topic = mongoose.model<ITopic>('Topic', topicSchema);