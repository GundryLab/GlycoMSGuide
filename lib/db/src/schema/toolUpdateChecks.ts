import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Per-tool state for the monthly "check for new references / updates" job that
 * scans PubMed and GitHub for each MS software tool listed on the site.
 *
 * The job never edits page content: it records when each tool was last checked
 * and what the latest known publication / release was, and emails the
 * maintainer a digest of anything new. The frontend reads `lastCheckedAt` to
 * show a "Last checked" date on each tool card.
 */
export const toolUpdateChecksTable = pgTable("tool_update_checks", {
  id: serial("id").primaryKey(),
  // Matches SoftwareTool.name from @workspace/glyco-tools.
  toolName: text("tool_name").notNull().unique(),
  // "glycomics" | "glycoproteomics"
  category: text("category").notNull(),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // Most recent PubMed article id seen for this tool.
  latestPubmedId: text("latest_pubmed_id"),
  // Publication date of the most recent article seen (YYYY-MM-DD).
  latestPubDate: date("latest_pub_date", { mode: "string" }),
  // Most recent GitHub release tag / latest repo activity marker.
  latestReleaseTag: text("latest_release_tag"),
  latestReleaseAt: timestamp("latest_release_at", { withTimezone: true }),
  // True when the last run found something newer than the previously stored state.
  updateAvailable: boolean("update_available").notNull().default(false),
  // Free-form details of what the last run found (for the email digest / audit).
  findings: jsonb("findings"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertToolUpdateCheckSchema = createInsertSchema(
  toolUpdateChecksTable,
).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertToolUpdateCheck = z.infer<typeof insertToolUpdateCheckSchema>;
export type ToolUpdateCheck = typeof toolUpdateChecksTable.$inferSelect;
