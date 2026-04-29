import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import {
  db,
  mattersTable,
  contractsTable,
  documentsTable,
  deadlinesTable,
} from "@workspace/db";
import {
  CreateMatterBody,
  GetMatterParams,
  UpdateMatterParams,
  UpdateMatterBody,
  DeleteMatterParams,
  ListMattersQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters", async (req, res): Promise<void> => {
  const params = ListMattersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = params.data.status
    ? await db
        .select()
        .from(mattersTable)
        .where(eq(mattersTable.status, params.data.status))
        .orderBy(desc(mattersTable.updatedAt))
    : await db
        .select()
        .from(mattersTable)
        .orderBy(desc(mattersTable.updatedAt));
  res.json(rows);
});

router.post("/matters", async (req, res): Promise<void> => {
  const parsed = CreateMatterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(mattersTable)
    .values({
      name: parsed.data.name,
      client: parsed.data.client,
      jurisdiction: parsed.data.jurisdiction,
      status: parsed.data.status ?? "active",
      description: parsed.data.description ?? null,
      practiceArea: parsed.data.practiceArea ?? null,
    })
    .returning();
  res.status(201).json(row);
});

router.get("/matters/:id", async (req, res): Promise<void> => {
  const params = GetMatterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(mattersTable)
    .where(eq(mattersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  const [{ count: contractCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractsTable)
    .where(eq(contractsTable.matterId, params.data.id));
  const [{ count: documentCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documentsTable)
    .where(eq(documentsTable.matterId, params.data.id));
  const [{ count: deadlineCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deadlinesTable)
    .where(eq(deadlinesTable.matterId, params.data.id));
  res.json({ ...row, contractCount, documentCount, deadlineCount });
});

router.patch("/matters/:id", async (req, res): Promise<void> => {
  const params = UpdateMatterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMatterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(mattersTable)
    .set(parsed.data)
    .where(eq(mattersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  res.json(row);
});

router.delete("/matters/:id", async (req, res): Promise<void> => {
  const params = DeleteMatterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(mattersTable)
    .where(eq(mattersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
