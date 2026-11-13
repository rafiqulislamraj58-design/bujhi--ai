import { Router } from 'express';
import { 
    createClass, 
    createSubject, 
    createTopic,
    getAllClasses, 
    getSubjectsByClass ,
    getTopicsBySubject
} from '../controllers/academic.controller.js';
// 

const router = Router();

// ==========================================
// ADMIN ROUTES (POST)
// ==========================================

router.post('/classes', createClass);
// 
router.post('/subjects', createSubject);
// 
router.post('/topics', createTopic);


// ==========================================
// STUDENT/PUBLIC ROUTES (GET)
// ==========================================

router.get('/classes', getAllClasses);
router.get('/subjects/:subjectId/topics', getTopicsBySubject);

router.get('/classes/:classId/subjects', getSubjectsByClass);

export default router;