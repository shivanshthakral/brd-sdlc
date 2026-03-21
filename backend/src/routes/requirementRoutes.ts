import { Router } from "express";
import { getRequirements, createRequirement } from "../controllers/requirementController";
import { protect } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();

router.get("/:projectId", protect, getRequirements);
router.post("/", protect, upload.array("files", 10), createRequirement);

export default router;
