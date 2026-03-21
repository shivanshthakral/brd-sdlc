import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Requirement from "../models/Requirement";
import Project from "../models/Project";

export const getRequirements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requirements = await Requirement.find({ projectId: req.params.projectId }).sort({ date: -1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching requirements" });
  }
};

export const createRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, type, date, textContent, links } = req.body;
    
    // Check if project exists and belongs to user
    const project = await Project.findOne({ projectId, userId: req.user._id });
    if (!project) {
      res.status(404).json({ message: "Project not found or unauthorized" });
      return;
    }

    const files = req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [];
    
    const parsedLinks = links ? (typeof links === 'string' ? JSON.parse(links) : links) : [];

    const requirement = new Requirement({
      projectId,
      type,
      date: date || new Date(),
      textContent: textContent || "",
      files,
      links: parsedLinks,
    });

    const savedRequirement = await requirement.save();
    res.status(201).json(savedRequirement);
  } catch (error: any) {
    res.status(500).json({ message: "Server error creating requirement", error: error.message });
  }
};
