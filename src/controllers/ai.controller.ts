import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import Groq from "groq-sdk";
import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
    HumanMessage,
    AIMessage,
    SystemMessage,
    type BaseMessage,
} from "@langchain/core/messages";
import { ChatHistory } from '../models/chat.model.js';

// ==========================================
// 1. ENVIRONMENT & CONFIGURATION
// ==========================================

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// ==========================================
// 2. AI MODEL INITIALIZATION
// ==========================================

const groqModel = new ChatGroq({
    apiKey: GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxRetries: 1,
});

const geminiModel = new ChatGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0.7,
});

const modelWithFallback = groqModel.withFallbacks({
    fallbacks: [geminiModel],
});

// Groq SDK for Whisper
const groqClient = new Groq({
    apiKey: GROQ_API_KEY,
});

// ==========================================
// 3. BUJHI AI PERSONALITY
// ==========================================

const SYSTEM_PROMPT = `
You are Bujhi AI, a friendly, intelligent and interactive educational companion for students in Bangladesh.

IDENTITY & ORIGIN (CRITICAL RULES):
- Your name is Bujhi AI.
- You were created and developed by a solo tech entrepreneur and software developer from Bangladesh.
- If anyone asks "Who created you?", "Who made you?", or "তোমার মালিক কে?", you MUST answer: "আমি বুঝি এআই। আমাকে বাংলাদেশের একজন সফটওয়্যার ডেভেলপার তৈরি করেছেন Rafiqul islam raj ।"
- NEVER say you were created by OpenAI, Google, Groq, Meta, or Llama. You have NO connection to them.
- You are an independent educational AI companion built specifically for the students of Bangladesh.

PERSONALITY:
- Talk naturally like a helpful human.
- Be warm, friendly and respectful.
- Speak natural Bengali by default.
- Understand Bengali, English and Banglish.
- Avoid robotic and textbook-style language.
- Use everyday examples from Bangladesh.
- Be patient and supportive.

CONVERSATION:
- Remember the available conversation history.
- Understand follow-up questions.
- Maintain conversational continuity.
- Ask useful follow-up questions when appropriate.
- Do not ask unnecessary questions after every answer.
- Respond naturally to greetings, jokes and thanks.
- Explain difficult topics in simple language.
- Adapt explanations to the user's learning level.
- Never invent previous conversation details.

VOICE STYLE:
- Keep normal answers concise.
- Prefer 2-5 sentences for simple questions.
- Avoid unnecessary headings and markdown.
- Give detailed explanations when requested.
- Use natural spoken Bengali.
- CRITICAL RULE: NEVER use emojis, markdown, asterisks, or special characters. Use plain raw text ONLY.

EDUCATIONAL ROLE:
- Help students understand programming, technology, science and general education.
- Provide practical step-by-step guidance.
- Encourage curiosity and critical thinking.
`;
// ==========================================
// 4. CONVERSATION MEMORY
// ==========================================


const conversationStore = new Map<
    string,
    BaseMessage[]
>();

const MAX_HISTORY_MESSAGES = 12;

// ==========================================
// 5. HELPER: EXTRACT AI TEXT
// ==========================================

const extractAIText = (content: unknown): string => {
    if (typeof content === "string") {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .map((item: any) => {
                if (typeof item === "string") {
                    return item;
                }
                if (item?.type === "text") {
                    return item.text || "";
                }
                return "";
            })
            .filter(Boolean)
            .join("\n");
    }
    return String(content ?? "");
};

// ==========================================
// 6. HELPER: PCM TO WAV (Removed - Not needed)
// ==========================================


// ==========================================
// 7. HELPER: SPEECH TO TEXT
// ==========================================

const transcribeAudio = async (
    audioBuffer: Buffer,
    mimeType: string
): Promise<string> => {
    const extensionMap: Record<string, string> = {
        "audio/webm": "webm",
        "audio/wav": "wav",
        "audio/mpeg": "mp3",
        "audio/mp3": "mp3",
        "audio/mp4": "mp4",
        "audio/ogg": "ogg",
        "audio/mp4a-latm": "m4a",
        "audio/x-m4a": "m4a",
    };

    const extension = extensionMap[mimeType] || "webm";

    const file = new File(
        [new Uint8Array(audioBuffer)],
        `recording.${extension}`,
        { type: mimeType }
    );

    const result = await groqClient.audio.transcriptions.create({
        file,
        model: "whisper-large-v3", 
        language: "bn",           
        response_format: "json",
        temperature: 0,
    });

    return result.text.trim();
};

// ==========================================
// 8. HELPER: GENERATE AI RESPONSE
// ==========================================

const generateAIResponse = async (
    sessionId: string,
    question: string
): Promise<string> => {
    
    // 
    let chatRecord = await ChatHistory.findOne({ sessionId });
    
    let history: BaseMessage[] = [];

    if (chatRecord) {
        //
        history = chatRecord.messages.map(msg => 
            msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        );
    } else {
        //
        chatRecord = new ChatHistory({ sessionId, messages: [] });
    }

    // 
    const messages: BaseMessage[] = [
        new SystemMessage(SYSTEM_PROMPT),
        ...history,
        new HumanMessage(question),
    ];

    // 
    const response = await modelWithFallback.invoke(messages);
    const answer = extractAIText(response.content);

    if (!answer.trim()) {
        throw new Error("AI generated an empty response");
    }

    // 
    chatRecord.messages.push({ role: 'user', content: question });
    chatRecord.messages.push({ role: 'ai', content: answer });

    // 
    if (chatRecord.messages.length > 20) {
        chatRecord.messages = chatRecord.messages.slice(-20);
    }

    await chatRecord.save();

    return answer;
};

// ==========================================
// 9. HELPER: TEXT TO SPEECH (Handled by Frontend)
// ==========================================

const generateAIResponseVoice = async (
    text: string
): Promise<{
    audioBase64: string | null;
    audioMimeType: string | null;
}> => {
   
    return {
        audioBase64: null,
        audioMimeType: null,
    };
};

// ==========================================
// 10. NORMAL TEXT CHAT CONTROLLER
// ==========================================

export const askBujhi = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { question } = req.body;

        if (typeof question !== "string" || !question.trim()) {
            res.status(400).json({
                success: false,
                message: "Question is required",
            });
            return;
        }

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_PROMPT],
            ["human", "{input}"],
        ]);

        const chain = prompt.pipe(modelWithFallback);

        const response = await chain.invoke({
            input: question.trim(),
        });

        res.status(200).json({
            success: true,
            answer: extractAIText(response.content),
        });

    } catch (error) {
        console.error("Bujhi Chat Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate AI response",
        });
    }
};

// ==========================================
// 11. ADVANCED VOICE CONTROLLER
// ==========================================

export const askBujhiVoice = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            audioBase64,
            mimeType = "audio/webm",
            sessionId,
        } = req.body;

        // ----------------------------------
        // Validate audio input
        // ----------------------------------
        if (typeof audioBase64 !== "string" || !audioBase64.trim()) {
            res.status(400).json({
                success: false,
                message: "Audio data is required",
            });
            return;
        }

        const allowedMimeTypes = [
            "audio/webm",
            "audio/wav",
            "audio/mpeg",
            "audio/mp3",
            "audio/mp4",
            "audio/ogg",
            "audio/mp4a-latm",
            "audio/x-m4a",
        ];

        if (typeof mimeType !== "string" || !allowedMimeTypes.includes(mimeType)) {
            res.status(415).json({
                success: false,
                message: "Unsupported audio format",
            });
            return;
        }

        // Base64 payload limit
        if (audioBase64.length > 28 * 1024 * 1024) {
            res.status(413).json({
                success: false,
                message: "Audio file is too large",
            });
            return;
        }

        // ----------------------------------
        // Session Management
        // ----------------------------------
        const currentSessionId =
            typeof sessionId === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(sessionId)
                ? sessionId
                : randomUUID();

        // ----------------------------------
        // Decode Audio
        // ----------------------------------
        const cleanBase64 = audioBase64.replace(
            /^data:audio\/[^;]+;base64,/,
            ""
        );

        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64) || cleanBase64.length % 4 !== 0) {
            res.status(400).json({
                success: false,
                message: "Invalid Base64 audio",
            });
            return;
        }

        const audioBuffer = Buffer.from(cleanBase64, "base64");

        // Maximum 20 MB decoded audio
        if (!audioBuffer.length || audioBuffer.length > 20 * 1024 * 1024) {
            res.status(413).json({
                success: false,
                message: "Invalid or oversized audio",
            });
            return;
        }

        // ----------------------------------
        // Speech To Text
        // ----------------------------------
        let studentText: string;

        try {
            studentText = await transcribeAudio(audioBuffer, mimeType);
        } catch (error) {
            console.error("Whisper Transcription Error:", error);
            res.status(502).json({
                success: false,
                message: "আপনার কথা বুঝতে সমস্যা হচ্ছে। আবার বলবেন কি?",
            });
            return;
        }

        console.log("🎧 Student Said:", studentText);

        // ----------------------------------
        // Handle Empty Audio
        // ----------------------------------
        if (!studentText) {
            res.status(200).json({
                success: true,
                sessionId: currentSessionId,
                recognizedText: "",
                answer: "আমি আপনার কথা ঠিকমতো শুনতে পাইনি। আরেকবার বলবেন কি?",
                audioBase64: null,
                audioMimeType: null,
            });
            return;
        }

        // ----------------------------------
        // Generate AI Text Response
        // ----------------------------------
        let answer: string;

        try {
            answer = await generateAIResponse(currentSessionId, studentText);
        } catch (error) {
            console.error("AI Generation Error:", error);
            res.status(502).json({
                success: false,
                sessionId: currentSessionId,
                recognizedText: studentText,
                message: "এই মুহূর্তে উত্তর তৈরি করা যাচ্ছে না। আবার চেষ্টা করুন।",
            });
            return;
        }

        // ----------------------------------
        // Generate AI Voice (Now just null)
        // ----------------------------------
        let audioBase64Response: string | null = null;
        let audioMimeType: string | null = null;

        try {
            const speech = await generateAIResponseVoice(answer);
            audioBase64Response = speech.audioBase64;
            audioMimeType = speech.audioMimeType;
        } catch (error) {
            console.error("TTS Error:", error);
        }

        // ----------------------------------
        // Final Response
        // ----------------------------------
        res.status(200).json({
            success: true,
            sessionId: currentSessionId,
            recognizedText: studentText,
            answer,
            audioBase64: audioBase64Response, // This will be null
            audioMimeType, // This will be null
            voiceAvailable: audioBase64Response !== null,
        });

    } catch (error) {
        console.error("Bujhi Voice Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "সার্ভারে সাময়িক সমস্যা হচ্ছে। আবার চেষ্টা করুন।",
        });
    }
};

// ==========================================
// 12. RESET CONVERSATION
// ==========================================

export const resetBujhiVoiceSession = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { sessionId } = req.body;

        if (typeof sessionId !== "string" || !sessionId.trim()) {
            res.status(400).json({
                success: false,
                message: "Session ID is required",
            });
            return;
        }

        conversationStore.delete(sessionId);

        res.status(200).json({
            success: true,
            message: "Conversation reset successfully",
        });

    } catch (error) {
        console.error("Session Reset Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset conversation",
        });
    }
};