import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const mattersTable = pgTable("matters", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  name: text("name").notNull(),
  client: text("client").notNull(),
  jurisdiction: text("jurisdiction").notNull().default("us"),
  status: text("status").notNull().default("active"),
  description: text("description"),
  practiceArea: text("practice_area"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Matter = typeof mattersTable.$inferSelect;
export type InsertMatter = typeof mattersTable.$inferInsert;
