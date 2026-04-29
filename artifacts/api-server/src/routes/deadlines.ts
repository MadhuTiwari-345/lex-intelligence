import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { db, deadlinesTable, mattersTable } from "@workspace/db";
import {
  CreateDeadlineBody,
  UpdateDeadlineParams,
  UpdateDeadlineBody,
  DeleteDeadlineParams,
  ListDeadlinesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/deadlines", async (req, res): Promise<void> => {
  const params = ListDeadlinesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conds = [];
  if (params.data.status)
    conds.push(eq(deadlinesTable.status, params.data.status));
  if (params.data.matterId !== undefined)
    conds.push(eq(deadlinesTable.matterId, params.data.matterId));

  const baseQuery = db
    .select({
      id: deadlinesTable.id,
      matterId: deadlinesTable.matterId,
      matterName: mattersTable.name,
      title: deadlinesTable.title,
      description: deadlinesTable.description,
      dueDate: deadlinesTable.dueDate,
      type: deadlinesTable.type,
      status: deadlinesTable.status,
      priority: deadlinesTable.priority,
      createdAt: deadlinesTable.createdAt,
    })
    .from(deadlinesTable)
    .leftJoin(mattersTable, eq(deadlinesTable.matterId, mattersTable.id));

  const rows =
    conds.length > 0
      ? await baseQuery.where(and(...conds)).orderBy(asc(deadlinesTable.dueDate))
      : await baseQuery.orderBy(asc(deadlinesTable.dueDate));
  res.json(rows);
});

router.post("/deadlines", async (req, res): Promise<void> => {
  const parsed = CreateDeadlineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(deadlinesTable)
    .values({
      matterId: parsed.data.matterId ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      dueDate: new Date(parsed.data.dueDate),
      type: parsed.data.type,
      priority: parsed.data.priority,
    })
    .returning();
  const [matter] = row.matterId
    ? await db
        .select({ name: mattersTable.name })
        .from(mattersTable)
        .where(eq(mattersTable.id, row.matterId))
    : [{ name: null }];
  res.status(201).json({ ...row, matterName: matter?.name ?? null });
});

router.get("/deadlines/upcoming", async (_req, res): Promise<void> => {
  const now = new Date();
  const rows = await db
    .select({
      id: deadlinesTable.id,
      matterId: deadlinesTable.matterId,
      matterName: mattersTable.name,
      title: deadlinesTable.title,
      description: deadlinesTable.description,
      dueDate: deadlinesTable.dueDate,
      type: deadlinesTable.type,
      status: deadlinesTable.status,
      priority: deadlinesTable.priority,
      createdAt: deadlinesTable.createdAt,
    })
    .from(deadlinesTable)
    .leftJoin(mattersTable, eq(deadlinesTable.matterId, mattersTable.id))
    .where(
      and(
        eq(deadlinesTable.status, "upcoming"),
        gte(deadlinesTable.dueDate, now),
      ),
    )
    .orderBy(asc(deadlinesTable.dueDate))
    .limit(7);
  res.json(rows);
});

router.patch("/deadlines/:id", async (req, res): Promise<void> => {
  const params = UpdateDeadlineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDeadlineBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.dueDate)
    updates.dueDate = new Date(parsed.data.dueDate);
  const [row] = await db
    .update(deadlinesTable)
    .set(updates)
    .where(eq(deadlinesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Deadline not found" });
    return;
  }
  const [matter] = row.matterId
    ? await db
        .select({ name: mattersTable.name })
        .from(mattersTable)
        .where(eq(mattersTable.id, row.matterId))
    : [{ name: null }];
  res.json({ ...row, matterName: matter?.name ?? null });
});

router.delete("/deadlines/:id", async (req, res): Promise<void> => {
  const params = DeleteDeadlineParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .delete(deadlinesTable)
    .where(eq(deadlinesTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Deadline not found" });
    return;
  }
  res.sendStatus(204);
});

// Mark missed: any upcoming deadline with dueDate < now should be flagged.
// We compute on read by adjusting the response status. (Simple approach.)
// Currently kept as stored. Could add a background job in a follow-up.

export default router;
