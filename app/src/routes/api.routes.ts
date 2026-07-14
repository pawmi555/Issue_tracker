import { Router } from "express";

import projectRoutes from "./project.routes.js";
import issueRoutes from "./issue.routes.js";
import commentRoutes from "./comment.routes.js";
import historyRoutes from "./history.routes.js";

const router = Router();

router.use("/projects", projectRoutes);

router.use("/", issueRoutes);

router.use("/", commentRoutes);

router.use("/", historyRoutes);

export default router;
