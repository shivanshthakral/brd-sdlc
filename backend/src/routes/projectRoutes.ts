import { Router } from "express";
import { getProjects, createProject, getProjectById, updateProject } from "../controllers/projectController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.route("/").get(protect, getProjects).post(protect, createProject);
router.route("/:id").get(protect, getProjectById).put(protect, updateProject);

export default router;
