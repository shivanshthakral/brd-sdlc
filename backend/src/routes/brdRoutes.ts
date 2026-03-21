import { Router } from "express";
import { getBRDVersions, generateBRD } from "../controllers/brdController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/:projectId", protect, getBRDVersions);
router.post("/generate", protect, generateBRD);

export default router;
