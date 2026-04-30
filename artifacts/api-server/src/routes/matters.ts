import { Router, type IRouter } from "express";
import { and, eq, desc, sql } from "drizzle-orm";
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
  const userId = req.userId!;
  const params = ListMattersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conds = [eq(mattersTable.userId, userId)];
  if (params.data.status) conds.push(eq(mattersTable.status, params.data.status));
  const rows = await db
    .select()
    .from(mattersTable)
    .where(and(...conds))
    .orderBy(desc(mattersTable.updatedAt));
  res.json(rows);
});

router.post("/matters", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = CreateMatterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(mattersTable)
    .values({
      userId,
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
  const userId = req.userId!;
  const params = GetMatterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(mattersTable)
    .where(
      and(eq(mattersTable.id, params.data.id), eq(mattersTable.userId, userId)),
    );
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  const [{ count: contractCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contractsTable)
    .where(
      and(
        eq(contractsTable.matterId, params.data.id),
        eq(contractsTable.userId, userId),
      ),
    );
  const [{ count: documentCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documentsTable)
    .where(
      and(
        eq(documentsTable.matterId, params.data.id),
        eq(documentsTable.userId, userId),
      ),
    );
  const [{ count: deadlineCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(deadlinesTable)
    .where(
      and(
        eq(deadlinesTable.matterId, params.data.id),
        eq(deadlinesTable.userId, userId),
      ),
    );
  res.json({ ...row, contractCount, documentCount, deadlineCount });
});

router.patch("/matters/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
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
    .where(
      and(eq(mattersTable.id, params.data.id), eq(mattersTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  res.json(row);
});

router.delete("/matters/:id", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const params = DeleteMatterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(mattersTable)
    .where(
      and(eq(mattersTable.id, params.data.id), eq(mattersTable.userId, userId)),
    )
    .returning();
  if (!row) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
