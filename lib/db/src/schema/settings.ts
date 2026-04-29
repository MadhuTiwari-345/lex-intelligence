import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  firmName: text("firm_name"),
  attorneyName: text("attorney_name"),
  defaultJurisdiction: text("default_jurisdiction").notNull().default("us"),
  plan: text("plan").notNull().default("solo"),
});

export type Settings = typeof settingsTable.$inferSelect;
export type InsertSettings = typeof settingsTable.$inferInsert;
