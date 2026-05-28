import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { agents, companies, createDb, issueComments, issues } from "@fideliosai/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { issueService } from "../services/issues.ts";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping comment-cursor tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

/**
 * Regression for FID-64: the "comments after a cursor" query used to bind a JS
 * `Date` into a raw `sql` template, which the postgres driver cannot bind in an
 * untyped parameter slot — every `GET /comments?after=` (and the pre-compiled
 * heartbeat bundle's comment delta) threw a 500. Agents parsed the 500 as "0 new
 * comments" and silently stopped responding to follow-up Board comments.
 */
describeEmbeddedPostgres("issueService comment cursor", () => {
  let db!: ReturnType<typeof createDb>;
  let svc!: ReturnType<typeof issueService>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("fidelios-comment-cursor-");
    db = createDb(tempDb.connectionString);
    svc = issueService(db);
  }, 20_000);

  afterEach(async () => {
    await db.delete(issueComments);
    await db.delete(issues);
    await db.delete(agents);
    await db.delete(companies);
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  async function seed() {
    const companyId = randomUUID();
    const issueId = randomUUID();
    await db.insert(companies).values({
      id: companyId,
      name: "FideliOS",
      issuePrefix: `T${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      requireBoardApprovalForNewAgents: false,
    });
    await db.insert(issues).values({
      id: issueId,
      companyId,
      title: "Linkedin Post",
      status: "in_review",
    });

    const base = new Date("2026-05-28T11:00:00.000Z");
    const ids: string[] = [];
    // Microsecond-level precision on createdAt to prove the cursor stays
    // exclusive of the anchor row (the bug-era ms-truncation could re-include it).
    const offsetsMs = [0, 5 * 60_000, 11 * 60_000, 17 * 60_000, 30 * 60_000];
    for (let i = 0; i < offsetsMs.length; i++) {
      const id = randomUUID();
      ids.push(id);
      await db.insert(issueComments).values({
        id,
        companyId,
        issueId,
        authorUserId: i % 2 === 0 ? "local-board" : null,
        body: `comment ${i}`,
        createdAt: new Date(base.getTime() + offsetsMs[i]),
      });
    }
    return { companyId, issueId, ids };
  }

  it("returns comments created after the anchor (asc), exclusive of the anchor", async () => {
    const { issueId, ids } = await seed();
    const after = await svc.listComments(issueId, { afterCommentId: ids[0], order: "asc" });
    expect(after.map((c) => c.id)).toEqual(ids.slice(1));
  });

  it("returns comments before the anchor (desc), exclusive of the anchor", async () => {
    const { issueId, ids } = await seed();
    const before = await svc.listComments(issueId, { afterCommentId: ids[4], order: "desc" });
    expect(before.map((c) => c.id)).toEqual([ids[3], ids[2], ids[1], ids[0]]);
  });

  it("returns [] when the anchor id does not exist on the issue", async () => {
    const { issueId } = await seed();
    const result = await svc.listComments(issueId, { afterCommentId: randomUUID(), order: "asc" });
    expect(result).toEqual([]);
  });

  it("surfaces only the delta comments in the heartbeat context bundle", async () => {
    const { issueId, ids } = await seed();
    const bundle = await svc.buildHeartbeatContextBundle(issueId, { lastSeenCommentId: ids[2] });
    expect(bundle).not.toBeNull();
    expect(bundle!.markdown).toContain("comment 3");
    expect(bundle!.markdown).toContain("comment 4");
    expect(bundle!.markdown).not.toContain("comment 1");
    expect(bundle!.commentCursor.latestCommentId).toBe(ids[4]);
  });
});
