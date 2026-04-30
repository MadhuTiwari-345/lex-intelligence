import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type Citation = {
  caseName: string;
  citation: string;
  court?: string | null;
  year?: number | null;
  summary: string;
  relevance?: string | null;
};

export const researchQueriesTable = pgTable("research_queries", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  matterId: integer("matter_id"),
  question: text("question").notNull(),
  jurisdiction: text("jurisdiction").notNull().default("us"),
  summary: text("summary").notNull().default(""),
  riskFlags: jsonb("risk_flags").$type<string[]>().notNull().default([]),
  citations: jsonb("citations").$type<Citation[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ResearchQuery = typeof researchQueriesTable.$inferSelect;
export type InsertResearchQuery = typeof researchQueriesTable.$inferInsert;
