/**
 * Monthly "check for tool updates" job for the MS Software page.
 *
 * For every MS software tool listed on the site, this job:
 *   1. Queries PubMed for the most recent publication mentioning the tool.
 *   2. Checks the tool's GitHub repository (when its URL is a GitHub repo) for
 *      recent activity / the latest release.
 *   3. Records the "last checked" date and the latest known publication/release
 *      in the `tool_update_checks` table (read by the frontend to show a
 *      "Last checked" date on each tool card).
 *   4. Emails the maintainer a digest of anything NEW since the previous run.
 *
 * It is FLAG-ONLY: it never edits page content. The first run for a tool simply
 * establishes a baseline (no alert); subsequent runs flag changes relative to
 * the stored baseline, so the maintainer is not flooded on first run.
 *
 * Run via: pnpm --filter @workspace/scripts run check-tool-updates
 *
 * Optional env:
 *   CHECK_TOOL_UPDATES_RECIPIENT  override maintainer email
 *   NCBI_API_KEY                  raises PubMed rate limit (3 -> 10 req/s)
 *   GITHUB_TOKEN                  raises GitHub rate limit (60 -> 5000 req/h)
 */

import { db, toolUpdateChecksTable } from "@workspace/db";
import {
  glycomicsTools,
  glycoproteomicsTools,
  type SoftwareTool,
} from "@workspace/glyco-tools";
import { sql } from "drizzle-orm";
import { sendMaintainerDigest } from "./email";

const MAINTAINER_EMAIL =
  process.env.CHECK_TOOL_UPDATES_RECIPIENT ?? "rebekah.gundry@unmc.edu";

const NCBI_API_KEY = process.env.NCBI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const NCBI_TOOL = "GlycoMSGuide";
const NCBI_EMAIL = MAINTAINER_EMAIL;

// Be polite to NCBI: 3 req/s without a key, 10 with. We make 2 calls per tool.
const PUBMED_DELAY_MS = NCBI_API_KEY ? 150 : 400;

type Category = "glycomics" | "glycoproteomics";

interface PubMedHit {
  pmid: string;
  date: string | null; // YYYY-MM-DD
  title: string;
}

interface GitHubHit {
  pushedAt: string | null; // ISO
  releaseTag: string | null;
  htmlUrl: string;
}

interface Finding {
  kind: "pubmed" | "github";
  message: string;
  link: string;
}

interface ToolResult {
  tool: SoftwareTool;
  category: Category;
  findings: Finding[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.warn(`  ! HTTP ${res.status} for ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`  ! request failed for ${url}: ${(err as Error).message}`);
    return null;
  }
}

function withNcbiParams(url: string): string {
  const u = new URL(url);
  u.searchParams.set("tool", NCBI_TOOL);
  u.searchParams.set("email", NCBI_EMAIL);
  if (NCBI_API_KEY) u.searchParams.set("api_key", NCBI_API_KEY);
  return u.toString();
}

/** Normalize PubMed "sortpubdate" ("2024/06/28 00:00") to YYYY-MM-DD. */
function normalizePubDate(sortpubdate?: string): string | null {
  if (!sortpubdate) return null;
  const m = sortpubdate.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

async function pubmedLatest(toolName: string): Promise<PubMedHit | null> {
  const term = `"${toolName}"[Title] AND (glycan OR glycomic OR glycoproteomic OR glycosylation OR glycopeptide)`;
  const esearchUrl = withNcbiParams(
    `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&retmax=1&sort=pub_date&term=${encodeURIComponent(
      term,
    )}`,
  );

  const search = await fetchJson<{
    esearchresult?: { idlist?: string[] };
  }>(esearchUrl);
  const pmid = search?.esearchresult?.idlist?.[0];
  if (!pmid) return null;

  await sleep(PUBMED_DELAY_MS);

  const esummaryUrl = withNcbiParams(
    `${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${pmid}`,
  );
  const summary = await fetchJson<{
    result?: Record<string, { title?: string; sortpubdate?: string }>;
  }>(esummaryUrl);

  const rec = summary?.result?.[pmid];
  return {
    pmid,
    date: normalizePubDate(rec?.sortpubdate),
    title: rec?.title ?? "(title unavailable)",
  };
}

function parseGitHubRepo(url?: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
}

async function githubActivity(url?: string): Promise<GitHubHit | null> {
  const parsed = parseGitHubRepo(url);
  if (!parsed) return null;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "GlycoMSGuide-tool-update-checker",
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const repo = await fetchJson<{ pushed_at?: string; html_url?: string }>(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
    { headers },
  );
  if (!repo) return null;

  // Latest release is optional — many repos have none.
  const release = await fetchJson<{ tag_name?: string }>(
    `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases/latest`,
    { headers },
  );

  return {
    pushedAt: repo.pushed_at ?? null,
    releaseTag: release?.tag_name ?? null,
    htmlUrl: repo.html_url ?? `https://github.com/${parsed.owner}/${parsed.repo}`,
  };
}

function isNewerIso(candidate: string | null, baseline: string | null): boolean {
  if (!candidate) return false;
  if (!baseline) return false;
  const c = Date.parse(candidate);
  const b = Date.parse(baseline);
  if (Number.isNaN(c) || Number.isNaN(b)) return false;
  return c > b;
}

interface ExistingRow {
  latestPubmedId: string | null;
  latestReleaseAt: Date | null;
  latestReleaseTag: string | null;
}

async function loadExisting(): Promise<Map<string, ExistingRow>> {
  const rows = await db
    .select({
      toolName: toolUpdateChecksTable.toolName,
      latestPubmedId: toolUpdateChecksTable.latestPubmedId,
      latestReleaseAt: toolUpdateChecksTable.latestReleaseAt,
      latestReleaseTag: toolUpdateChecksTable.latestReleaseTag,
    })
    .from(toolUpdateChecksTable);

  const map = new Map<string, ExistingRow>();
  for (const r of rows) {
    map.set(r.toolName, {
      latestPubmedId: r.latestPubmedId,
      latestReleaseAt: r.latestReleaseAt,
      latestReleaseTag: r.latestReleaseTag,
    });
  }
  return map;
}

async function processTool(
  tool: SoftwareTool,
  category: Category,
  existing: ExistingRow | undefined,
): Promise<ToolResult> {
  const findings: Finding[] = [];
  const isBaseline = existing === undefined;

  // ---- PubMed ----
  let latestPubmedId = existing?.latestPubmedId ?? null;
  let latestPubDate: string | null = null;
  const pub = await pubmedLatest(tool.name);
  if (pub) {
    latestPubDate = pub.date;
    // Flag when a newer/different PMID appears than the stored baseline. This
    // includes the null -> value case (no paper known before, one found now).
    const knownPmid = existing?.latestPubmedId ?? null;
    if (!isBaseline && pub.pmid !== knownPmid) {
      findings.push({
        kind: "pubmed",
        message: `New PubMed match: "${pub.title}"${pub.date ? ` (${pub.date})` : ""}`,
        link: `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`,
      });
    }
    latestPubmedId = pub.pmid;
  }
  await sleep(PUBMED_DELAY_MS);

  // ---- GitHub ----
  let latestReleaseAt: Date | null = existing?.latestReleaseAt ?? null;
  let latestReleaseTag: string | null = existing?.latestReleaseTag ?? null;
  const gh = await githubActivity(tool.url);
  if (gh) {
    const newPush =
      !isBaseline &&
      gh.pushedAt &&
      existing?.latestReleaseAt &&
      isNewerIso(gh.pushedAt, existing.latestReleaseAt.toISOString());
    const newTag =
      !isBaseline &&
      gh.releaseTag &&
      gh.releaseTag !== (existing?.latestReleaseTag ?? null);

    if (newPush || newTag) {
      const parts: string[] = [];
      if (newTag) parts.push(`new release ${gh.releaseTag}`);
      if (newPush) parts.push(`repository updated ${gh.pushedAt?.slice(0, 10)}`);
      findings.push({
        kind: "github",
        message: `GitHub activity: ${parts.join("; ")}`,
        link: gh.htmlUrl,
      });
    }
    if (gh.pushedAt) latestReleaseAt = new Date(gh.pushedAt);
    if (gh.releaseTag) latestReleaseTag = gh.releaseTag;
  }

  const updateAvailable = findings.length > 0;

  await db
    .insert(toolUpdateChecksTable)
    .values({
      toolName: tool.name,
      category,
      lastCheckedAt: new Date(),
      latestPubmedId,
      latestPubDate,
      latestReleaseTag,
      latestReleaseAt,
      updateAvailable,
      findings: findings.length ? findings : null,
    })
    .onConflictDoUpdate({
      target: toolUpdateChecksTable.toolName,
      set: {
        category,
        lastCheckedAt: new Date(),
        latestPubmedId,
        latestPubDate,
        latestReleaseTag,
        latestReleaseAt,
        updateAvailable,
        findings: findings.length ? findings : null,
        updatedAt: new Date(),
      },
    });

  return { tool, category, findings };
}

function buildDigest(results: ToolResult[]): string {
  const flagged = results.filter((r) => r.findings.length > 0);
  const lines: string[] = [];
  lines.push("GlycoMSGuide — monthly MS software update check");
  lines.push(`Run date: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`Tools checked: ${results.length}`);
  lines.push("");
  lines.push(
    "The following tools may have new references or releases. This is a flag-only " +
      "notification — no website content has been changed. Please review and update " +
      "the site manually if appropriate.",
  );
  lines.push("");

  for (const r of flagged) {
    lines.push(`• ${r.tool.name} (${r.category})`);
    for (const f of r.findings) {
      lines.push(`    - ${f.message}`);
      lines.push(`      ${f.link}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main(): Promise<void> {
  // Some tools (e.g. Genedata Expressionist) are listed under both categories.
  // They are the same product, so check each tool once (keyed by name, which is
  // the table's natural key) to avoid duplicate API calls and duplicate alerts.
  const seen = new Set<string>();
  const tools: Array<{ tool: SoftwareTool; category: Category }> = [
    ...glycomicsTools.map((tool) => ({ tool, category: "glycomics" as const })),
    ...glycoproteomicsTools.map((tool) => ({
      tool,
      category: "glycoproteomics" as const,
    })),
  ].filter(({ tool }) => {
    if (seen.has(tool.name)) return false;
    seen.add(tool.name);
    return true;
  });

  console.log(
    `Checking ${tools.length} tools for new references/releases…\n`,
  );

  const existing = await loadExisting();
  const firstRun = existing.size === 0;
  if (firstRun) {
    console.log(
      "No prior check state found — this run establishes a baseline (no alerts).\n",
    );
  }

  const results: ToolResult[] = [];
  for (const { tool, category } of tools) {
    process.stdout.write(`- ${tool.name} … `);
    try {
      const result = await processTool(tool, category, existing.get(tool.name));
      results.push(result);
      console.log(
        result.findings.length ? `${result.findings.length} finding(s)` : "ok",
      );
    } catch (err) {
      console.log(`error: ${(err as Error).message}`);
    }
  }

  const flagged = results.filter((r) => r.findings.length > 0);
  console.log(
    `\nDone. ${flagged.length} of ${results.length} tools have potential updates.`,
  );

  if (flagged.length > 0) {
    const digest = buildDigest(results);
    const subject = `[GlycoMSGuide] ${flagged.length} MS software tool(s) may have updates`;
    const result = await sendMaintainerDigest(
      MAINTAINER_EMAIL,
      subject,
      digest,
    );
    console.log(
      result.sent
        ? `\nDigest emailed to ${MAINTAINER_EMAIL}.`
        : `\nDigest NOT emailed (${result.reason}); see console output above.`,
    );
  } else {
    console.log("\nNothing new — no email sent.");
  }

  // Quick visibility into total rows tracked.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(toolUpdateChecksTable);
  console.log(`tool_update_checks now tracks ${count} tools.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("checkToolUpdates failed:", err);
    process.exit(1);
  });
