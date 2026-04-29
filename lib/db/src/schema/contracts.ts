import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type RiskFlag = {
  clause: string;
  severity: "low" | "medium" | "high" | "critical";
  explanation: string;
};

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id"),
  title: text("title").notNull(),
  type: text("type").notNull().default("other"),
  jurisdiction: text("jurisdiction").notNull().default("us"),
  status: text("status").notNull().default("draft"),
  counterparty: text("counterparty"),
  content: text("content").notNull().default(""),
  riskScore: integer("risk_score"),
  riskFlags: jsonb("risk_flags").$type<RiskFlag[]>().notNull().default([]),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Contract = typeof contractsTable.$inferSelect;
export type InsertContract = typeof contractsTable.$inferInsert;
