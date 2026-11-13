import { Router } from 'express';
import { askBujhi, askBujhiVoice } from '../controllers/ai.controller.js';
import {
  generateFlashcards,
  saveFlashcards,
  getFlashcardsByTopic
} from '../controllers/admin.ai.controller.js';

const router = Router();

// AI Chat
router.post('/ask', askBujhi);
router.post('/voice', askBujhiVoice);

// Admin Flashcards
router.post('/admin/generate-flashcards', generateFlashcards);
router.post('/admin/save-flashcards', saveFlashcards);
// 
router.get('/topics/:topicId/flashcards', getFlashcardsByTopic);

export default router;