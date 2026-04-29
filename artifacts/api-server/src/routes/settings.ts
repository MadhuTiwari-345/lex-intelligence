import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const [existing] = await db.select().from(settingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(settingsTable)
    .values({
      defaultJurisdiction: "us",
      plan: "solo",
    })
    .returning();
  return created;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const row = await ensureSettings();
  res.json(row);
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await ensureSettings();
  const [row] = await db
    .update(settingsTable)
    .set(parsed.data)
    .where(eq(settingsTable.id, existing.id))
    .returning();
  res.json(row);
});

export default router;
