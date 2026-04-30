import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, briefsTable } from "@workspace/db";
import {
  CreateBriefBody,
  GetBriefParams,
  DeleteBriefParams,
} from "@workspace/api-zod";
import { generateBrief } from "../lib/ai";

const router: IRouter = Router();

router.get("/briefs", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const rows = await db
    .select()
    .from(briefsTable)
    .where(eq(briefsTable.userId, userId))
    .orderBy(desc(briefsTable.createdAt));
  res.json(rows);
});

router.post("/briefs", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = CreateBriefBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const result = await generateBrief({
      originalText: parsed.data.originalText,
      complexity: parsed.data.complexity,
    });
    const [row] = await db
      .insert(briefsTable)
      .values({
        userId,
        matterId: parsed.data.matterId ?? null,
        title: parsed.data.title,
        originalText: parsed.data.originalText,
        plainEnglish: result.plainEnglish,
        keyPoints: result.keyPoints,
        complexity: parsed.data.complexity,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Brief generation failed");
    res.status(500).json({ error: "Failed to generate brief" });
  }
});

router.get("/briefs/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = GetBriefParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(briefsTable)
    .where(
      and(eq(briefsTable.id, params.data.id), eq(briefsTable.userId, userId)),
    );
  if (!row) {
    res.status(404).json({ error: "Brief not found" });
    return;
  }
  res.json(row);
});

router.delete("/briefs/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = DeleteBriefParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(briefsTable)
    .where(
      and(eq(briefsTable.id, params.data.id), eq(briefsTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Brief not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
