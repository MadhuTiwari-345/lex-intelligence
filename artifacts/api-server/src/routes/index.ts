import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import mattersRouter from "./matters";
import contractsRouter from "./contracts";
import documentsRouter from "./documents";
import deadlinesRouter from "./deadlines";
import researchRouter from "./research";
import briefsRouter from "./briefs";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(mattersRouter);
router.use(contractsRouter);
router.use(documentsRouter);
router.use(deadlinesRouter);
router.use(researchRouter);
router.use(briefsRouter);
router.use(settingsRouter);

export default router;
