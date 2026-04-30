import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, contractsTable } from "@workspace/db";
import {
  CreateContractBody,
  DraftContractBody,
  GetContractParams,
  UpdateContractParams,
  UpdateContractBody,
  DeleteContractParams,
  AnalyzeContractParams,
  ListContractsQueryParams,
} from "@workspace/api-zod";
import { analyzeContractContent, draftContract } from "../lib/ai";

const router: IRouter = Router();

router.get("/contracts", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = ListContractsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conds = [eq(contractsTable.userId, userId)];
  if (params.data.matterId !== undefined)
    conds.push(eq(contractsTable.matterId, params.data.matterId));
  if (params.data.status)
    conds.push(eq(contractsTable.status, params.data.status));
  const rows = await db
    .select()
    .from(contractsTable)
    .where(and(...conds))
    .orderBy(desc(contractsTable.updatedAt));
  res.json(rows);
});

router.post("/contracts", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = CreateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(contractsTable)
    .values({
      userId,
      matterId: parsed.data.matterId ?? null,
      title: parsed.data.title,
      type: parsed.data.type,
      jurisdiction: parsed.data.jurisdiction,
      status: parsed.data.status ?? "draft",
      counterparty: parsed.data.counterparty ?? null,
      content: parsed.data.content,
    })
    .returning();
  res.status(201).json(row);
});

router.post("/contracts/draft", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = DraftContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const content = await draftContract({
      title: parsed.data.title,
      type: parsed.data.type,
      jurisdiction: parsed.data.jurisdiction,
      counterparty: parsed.data.counterparty,
      prompt: parsed.data.prompt,
    });
    const [row] = await db
      .insert(contractsTable)
      .values({
        userId,
        matterId: parsed.data.matterId ?? null,
        title: parsed.data.title,
        type: parsed.data.type,
        jurisdiction: parsed.data.jurisdiction,
        status: "draft",
        counterparty: parsed.data.counterparty ?? null,
        content,
      })
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err }, "Contract drafting failed");
    res.status(500).json({ error: "Failed to draft contract" });
  }
});

router.get("/contracts/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = GetContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.id, params.data.id),
        eq(contractsTable.userId, userId),
      ),
    );
  if (!row) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }
  res.json(row);
});

router.patch("/contracts/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = UpdateContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateContractBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(contractsTable)
    .set(parsed.data)
    .where(
      and(
        eq(contractsTable.id, params.data.id),
        eq(contractsTable.userId, userId),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }
  res.json(row);
});

router.delete("/contracts/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = DeleteContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(contractsTable)
    .where(
      and(
        eq(contractsTable.id, params.data.id),
        eq(contractsTable.userId, userId),
      ),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/contracts/:id/analyze", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = AnalyzeContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db
    .select()
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.id, params.data.id),
        eq(contractsTable.userId, userId),
      ),
    );
  if (!existing) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }
  try {
    const analysis = await analyzeContractContent({
      type: existing.type,
      jurisdiction: existing.jurisdiction,
      content: existing.content,
    });
    const [row] = await db
      .update(contractsTable)
      .set({
        riskScore: analysis.riskScore,
        riskFlags: analysis.riskFlags,
        summary: analysis.summary,
      })
      .where(
        and(
          eq(contractsTable.id, params.data.id),
          eq(contractsTable.userId, userId),
        ),
      )
      .returning();
    res.json(row);
  } catch (err) {
    req.log.error({ err }, "Contract analysis failed");
    res.status(500).json({ error: "Failed to analyze contract" });
  }
});

export default router;
