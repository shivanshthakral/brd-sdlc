import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { GoogleGenerativeAI } from "@google/generative-ai";
import BRD from "../models/BRD";
import Project from "../models/Project";
import Requirement from "../models/Requirement";
import fs from "fs";
import path from "path";

// Initialize Gemini API inside functions to ensure process.env is loaded

export const getBRDVersions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const versions = await BRD.find({ projectId: req.params.projectId }).sort({ version: -1 });
    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching BRD versions" });
  }
};

export const generateBRD = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    console.log("Generating BRD for Project ID:", projectId, "User ID:", req.user._id);

    const project = await Project.findOne({ projectId, userId: req.user._id });
    console.log("Found project in DB:", !!project);
    if (!project) {
      res.status(404).json({ message: "Project not found or unauthorized" });
      return;
    }

    const requirements = await Requirement.find({ projectId }).sort({ date: 1 });

    // Build context string from all requirements
    let contextString = `Project Info:\nName: ${project.projectName}\nClient: ${project.client}\nGeography: ${project.geography}\nOwner: ${project.owner}\n\n`;

    contextString += "Requirements & Discussions:\n";
    for (const req of requirements) {
      contextString += `\n--- [${req.type} on ${new Date(req.date).toLocaleDateString()}] ---\n`;
      if (req.textContent) contextString += `Notes: ${req.textContent}\n`;
      if (req.links && req.links.length > 0) contextString += `Links: ${req.links.join(", ")}\n`;
      if (req.files && req.files.length > 0) {
        contextString += "Attached Files:\n";
        for (const fileUrl of req.files) {
          const filepath = path.join(__dirname, "../..", fileUrl);
          if (fs.existsSync(filepath) && fileUrl.endsWith('.txt')) {
            try {
              const text = fs.readFileSync(filepath, 'utf8');
              contextString += `[Content of ${fileUrl}]: ${text.substring(0, 1000)}... \n`;
            } catch (e) { }
          } else {
            contextString += `[File Documented: ${fileUrl}]\n`;
          }
        }
      }
    }

    const prompt = `You are a Senior Business Analyst. Generate a professional enterprise Business Requirement Document (BRD) based ENTIRELY and STRICTLY on the following compiled context. Do not invent any new features or assumptions outside the context.

Structure the document using these criteria:
At the absolute top of the document (before any intros or overviews), you MUST explicitly include a "Sources & References" section that dynamically lists exactly what inputs were provided (e.g. "Client Discussion", "Old Document", "Internal Discussion") along with the explicit Date on which they were held or provided.

Then structure the rest strictly using these headers (use proper formatting like bold, lists):
1. Project Overview
2. Business Objectives
3. Stakeholders
4. Functional Requirements
5. Non-Functional Requirements
6. Assumptions & Constraints

Make sure to synthesize all the discussion notes, file references, and URLs into a cohesive document. The writing style must be highly professional and suitable for an enterprise environment. Extract any implied requirements directly from the transcripts. Do not write filler intros or outtros.

Context:
${contextString}
`;

    // Use @google/generative-ai SDK (getGenerativeModel + generateContent)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedContent = response.text() || "Failed to generate BRD content.";

    // Determine latest version
    const lastBRD = await BRD.findOne({ projectId }).sort({ version: -1 });
    const nextVersion = lastBRD ? lastBRD.version + 1 : 1;

    // Save BRD
    const newBrd = new BRD({
      projectId,
      version: nextVersion,
      content: generatedContent,
    });
    const savedBrd = await newBrd.save();

    // Update Project Status unconditionally so UI logic knows BRD exists
    project.status = "Analysis";
    await project.save();

    res.status(201).json(savedBrd);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ message: "Error generating BRD with Gemini", error: error.message });
  }
};

export const updateBRD = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { brdId } = req.params;
    const { content } = req.body;

    const updatedBrd = await BRD.findByIdAndUpdate(
      brdId,
      { content },
      { new: true }
    );

    if (!updatedBrd) {
      res.status(404).json({ message: "BRD not found" });
      return;
    }

    res.json(updatedBrd);
  } catch (error: any) {
    console.error("Error updating BRD:", error);
    res.status(500).json({ message: "Error updating BRD", error: error.message });
  }
};
