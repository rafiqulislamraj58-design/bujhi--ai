import type { Request, Response, NextFunction } from 'express';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Flashcard } from '../models/flashcard.model.js';

// 
const geminiAdminModel = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-4-hydrogen',
    temperature: 0.2, // 
});

export const generateFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { textContent, count = 5 } = req.body;

        if (!textContent) {
            res.status(400).json({ success: false, message: 'Text content is required' });
            return;
        }

        //
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `You are an expert educational content creator. Extract important concepts from the given text and create exactly {count} flashcards. 
            You MUST return ONLY a raw JSON array. Do not include markdown formatting like \`\`\`json or any other text.
            Format exactly like this:
            [
              {{ "question": "Question here", "answer": "Answer here" }}
            ]`],
            ["human", "{text}"]
        ]);

        const chain = prompt.pipe(geminiAdminModel);

        const response = await chain.invoke({
            count: count.toString(),
            text: textContent
        });

        // 
        let flashcards = [];
        try {
            // 
            const cleanJson = response.content.toString().replace(/```json/g, '').replace(/```/g, '').trim();
            flashcards = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("JSON Parse Error:", response.content);
            res.status(500).json({ success: false, message: 'AI did not return valid JSON' });
            return;
        }

        res.status(200).json({
            success: true,
            message: `Successfully generated ${flashcards.length} flashcards`,
            data: flashcards 
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to generate flashcards' });
    }
};

export const saveFlashcards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { topicId, flashcards } = req.body;

        if (!topicId || !flashcards || !Array.isArray(flashcards)) {
            res.status(400).json({ success: false, message: 'Topic ID and an array of flashcards are required' });
            return;
        }

        // 
        const flashcardsToSave = flashcards.map(fc => ({
            topicId,
            question: fc.question,
            answer: fc.answer
        }));

        // 
        const savedData = await Flashcard.insertMany(flashcardsToSave);

        res.status(201).json({
            success: true,
            message: `${savedData.length} flashcards successfully saved to database!`,
            data: savedData
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to save flashcards' });
    }
};

// FETCH FLASHCARDS BY TOPIC
export const getFlashcardsByTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { topicId } = req.params;

        if (!topicId) {
            res.status(400).json({ success: false, message: 'Topic ID is required' });
            return;
        }

        const flashcards = await Flashcard.find({ topicId, isActive: true });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch flashcards' });
    }
};
