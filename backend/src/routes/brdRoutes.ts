import { Router } from "express";
import { getBRDVersions, generateBRD, updateBRD } from "../controllers/brdController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/:projectId", protect, getBRDVersions);
router.post("/generate", protect, generateBRD);
router.put("/:brdId", protect, updateBRD);

export default router;
