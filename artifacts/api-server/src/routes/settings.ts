import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings(userId: string) {
  const [existing] = await db
    .select()
    .from(settingsTable)
    .where(eq(settingsTable.userId, userId))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(settingsTable)
    .values({
      userId,
      defaultJurisdiction: "us",
      plan: "solo",
    })
    .returning();
  return created;
}

router.get("/settings", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const row = await ensureSettings(userId);
  res.json(row);
});

router.patch("/settings", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await ensureSettings(userId);
  const [row] = await db
    .update(settingsTable)
    .set(parsed.data)
    .where(
      and(eq(settingsTable.id, existing.id), eq(settingsTable.userId, userId)),
    )
    .returning();
  res.json(row);
});

export default router;
