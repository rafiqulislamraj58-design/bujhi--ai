import type { Request, Response, NextFunction } from 'express';
import { Class, Subject, Topic } from '../models/academic.model.js';

// ==========================================
// ADMIN ROUTE CONTROLLERS
// ==========================================

// 1.
export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, level } = req.body;
        const newClass = await Class.create({ name, level });
        
        res.status(201).json({
            success: true,
            message: 'Class created successfully!',
            data: newClass
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. 
export const createSubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, classId, description } = req.body;
        const newSubject = await Subject.create({ name, classId, description });
        
        res.status(201).json({
            success: true,
            message: 'Subject created successfully!',
            data: newSubject
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// STUDENT ROUTE CONTROLLERS 
// ==========================================

// 3. 
export const getAllClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const classes = await Class.find({ isActive: true }).sort({ createdAt: 1 });
        
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4.
export const getSubjectsByClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { classId } = req.params;
        const subjects = await Subject.find({ classId, isActive: true });
        
        res.status(200).json({
            success: true,
            data: subjects
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// 5. CREATE TOPIC (Admin Route)
export const createTopic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, subjectId, description } = req.body;
        
        if (!name || !subjectId) {
            res.status(400).json({ success: false, message: 'Name and Subject ID are required' });
            return;
        }

        const newTopic = await Topic.create({ name, subjectId, description });
        
        res.status(201).json({
            success: true,
            message: 'Topic created successfully!',
            data: newTopic
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. GET TOPICS BY SUBJECT (Student Route)
export const getTopicsBySubject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { subjectId } = req.params;
        const topics = await Topic.find({ subjectId, isActive: true });
        
        res.status(200).json({
            success: true,
            data: topics
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};