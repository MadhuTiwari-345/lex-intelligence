import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const briefsTable = pgTable("briefs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  matterId: integer("matter_id"),
  title: text("title").notNull(),
  originalText: text("original_text").notNull(),
  plainEnglish: text("plain_english").notNull().default(""),
  keyPoints: jsonb("key_points").$type<string[]>().notNull().default([]),
  complexity: text("complexity").notNull().default("standard"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Brief = typeof briefsTable.$inferSelect;
export type InsertBrief = typeof briefsTable.$inferInsert;
