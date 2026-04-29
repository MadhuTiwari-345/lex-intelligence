import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import {
  CreateDocumentBody,
  GetDocumentParams,
  DeleteDocumentParams,
  AnalyzeDocumentParams,
  ListDocumentsQueryParams,
} from "@workspace/api-zod";
import { analyzeDocumentContent } from "../lib/ai";

const router: IRouter = Router();

router.get("/documents", async (req, res): Promise<void> => {
  const params = ListDocumentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows =
    params.data.matterId !== undefined
      ? await db
          .select()
          .from(documentsTable)
          .where(eq(documentsTable.matterId, params.data.matterId))
          .orderBy(desc(documentsTable.createdAt))
      : await db
          .select()
          .from(documentsTable)
          .orderBy(desc(documentsTable.createdAt));
  res.json(rows);
});

router.post("/documents", async (req, res): Promise<void> => {
  const parsed = CreateDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(documentsTable)
    .values({
      matterId: parsed.data.matterId ?? null,
      title: parsed.data.title,
      docType: parsed.data.docType ?? null,
      jurisdiction: parsed.data.jurisdiction,
      content: parsed.data.content,
    })
    .returning();
  res.status(201).json(row);
});

router.get("/documents/:id", async (req, res): Promise<void> => {
  const params = GetDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json(row);
});

router.delete("/documents/:id", async (req, res): Promise<void> => {
  const params = DeleteDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(documentsTable)
    .where(eq(documentsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/documents/:id/analyze", async (req, res): Promise<void> => {
  const params = AnalyzeDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  try {
    const analysis = await analyzeDocumentContent({
      jurisdiction: existing.jurisdiction,
      content: existing.content,
    });
    const [row] = await db
      .update(documentsTable)
      .set({
        summary: analysis.summary,
        riskScore: analysis.riskScore,
        clauseAnalysis: analysis.clauseAnalysis,
      })
      .where(eq(documentsTable.id, params.data.id))
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Document analysis failed");
    res.status(500).json({ error: "Failed to analyze document" });
  }
});

export default router;
