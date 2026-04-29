import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const deadlinesTable = pgTable("deadlines", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id"),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  type: text("type").notNull().default("internal"),
  status: text("status").notNull().default("upcoming"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Deadline = typeof deadlinesTable.$inferSelect;
export type InsertDeadline = typeof deadlinesTable.$inferInsert;
