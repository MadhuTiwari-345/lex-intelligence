import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type ClauseAnalysis = {
  clause: string;
  summary: string;
  severity: "low" | "medium" | "high" | "critical";
  recommendation?: string | null;
};

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  matterId: integer("matter_id"),
  title: text("title").notNull(),
  docType: text("doc_type"),
  jurisdiction: text("jurisdiction").notNull().default("us"),
  content: text("content").notNull().default(""),
  summary: text("summary"),
  riskScore: integer("risk_score"),
  clauseAnalysis: jsonb("clause_analysis")
    .$type<ClauseAnalysis[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LegalDocument = typeof documentsTable.$inferSelect;
export type InsertLegalDocument = typeof documentsTable.$inferInsert;
