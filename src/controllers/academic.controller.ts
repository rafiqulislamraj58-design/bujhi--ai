import type { Request, Response, NextFunction } from "express";
import { Class, Subject, Topic } from "../models/academic.model.js";

// ==========================================
// ADMIN ROUTE CONTROLLERS
// ==========================================

// 1. CREATE CLASS
export const createClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, level } = req.body;
    // TS Error ফিক্স করার জন্য as any দেওয়া হয়েছে
    const newClass = await Class.create({ name, level } as any);

    res.status(201).json({
      success: true,
      message: "Class created successfully!",
      data: newClass,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CREATE SUBJECT
export const createSubject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, classId, description } = req.body;
    const newSubject = await Subject.create({
      name,
      classId,
      description,
    } as any);

    res.status(201).json({
      success: true,
      message: "Subject created successfully!",
      data: newSubject,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. CREATE TOPIC (Admin Route)
export const createTopic = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, subjectId, description } = req.body;

    if (!name || !subjectId) {
      res
        .status(400)
        .json({ success: false, message: "Name and Subject ID are required" });
      return;
    }

    const newTopic = await Topic.create({
      name,
      subjectId,
      description,
    } as any);

    res.status(201).json({
      success: true,
      message: "Topic created successfully!",
      data: newTopic,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// STUDENT ROUTE CONTROLLERS
// ==========================================

// 3. GET ALL CLASSES
export const getAllClasses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const classes = await Class.find({ isActive: true } as any).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. GET SUBJECTS BY CLASS
export const getSubjectsByClass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.find({ classId, isActive: true } as any);

    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET TOPICS BY SUBJECT (Student Route)
export const getTopicsBySubject = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { subjectId } = req.params;
    const topics = await Topic.find({ subjectId, isActive: true } as any);

    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
