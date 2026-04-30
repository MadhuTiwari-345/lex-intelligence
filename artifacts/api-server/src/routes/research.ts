import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, researchQueriesTable } from "@workspace/db";
import {
  CreateResearchQueryBody,
  GetResearchQueryParams,
  DeleteResearchQueryParams,
} from "@workspace/api-zod";
import { runResearch } from "../lib/ai";

const router: IRouter = Router();

router.get("/research", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const rows = await db
    .select()
    .from(researchQueriesTable)
    .where(eq(researchQueriesTable.userId, userId))
    .orderBy(desc(researchQueriesTable.createdAt));
  res.json(rows);
});

router.post("/research", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = CreateResearchQueryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const result = await runResearch({
      question: parsed.data.question,
      jurisdiction: parsed.data.jurisdiction,
    });
    const [row] = await db
      .insert(researchQueriesTable)
      .values({
        userId,
        matterId: parsed.data.matterId ?? null,
        question: parsed.data.question,
        jurisdiction: parsed.data.jurisdiction,
        summary: result.summary,
        riskFlags: result.riskFlags,
        citations: result.citations,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Research failed");
    res.status(500).json({ error: "Failed to run research" });
  }
});

router.get("/research/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = GetResearchQueryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(researchQueriesTable)
    .where(
      and(
        eq(researchQueriesTable.id, params.data.id),
        eq(researchQueriesTable.userId, userId),
      ),
    );
  if (!row) {
    res.status(404).json({ error: "Research query not found" });
    return;
  }
  res.json(row);
});

router.delete("/research/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = DeleteResearchQueryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(researchQueriesTable)
    .where(
      and(
        eq(researchQueriesTable.id, params.data.id),
        eq(researchQueriesTable.userId, userId),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Research query not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
