import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolUpdatesRouter from "./toolUpdates";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolUpdatesRouter);

export default router;
