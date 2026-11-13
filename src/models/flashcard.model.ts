import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
    topicId: mongoose.Types.ObjectId; 
    question: string;
    answer: string;
    isActive: boolean;
}

const flashcardSchema = new Schema<IFlashcard>({
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);