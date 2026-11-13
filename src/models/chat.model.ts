import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    role: 'user' | 'ai' | 'system';
    content: string;
}

export interface IChatHistory extends Document {
    sessionId: string;
    userId?: mongoose.Types.ObjectId; 
    messages: IMessage[];
}

const chatHistorySchema = new Schema<IChatHistory>({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    messages: [{
        role: { type: String, enum: ['user', 'ai', 'system'], required: true },
        content: { type: String, required: true }
    }]
}, { timestamps: true });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);