import { Router, type IRouter } from "express";
import { asc } from "drizzle-orm";
import { db, toolUpdateChecksTable } from "@workspace/db";
import { ListToolUpdatesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

/**
 * GET /api/tool-updates
 * Returns the per-tool "last checked" date and update status produced by the
 * monthly checkToolUpdates job. The frontend uses this to show a "Last checked"
 * date on each MS software tool card.
 */
router.get("/tool-updates", async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        toolName: toolUpdateChecksTable.toolName,
        category: toolUpdateChecksTable.category,
        lastCheckedAt: toolUpdateChecksTable.lastCheckedAt,
        updateAvailable: toolUpdateChecksTable.updateAvailable,
      })
      .from(toolUpdateChecksTable)
      .orderBy(asc(toolUpdateChecksTable.toolName));

    const data = ListToolUpdatesResponse.parse(rows);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
