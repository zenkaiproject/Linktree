import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: serial().primaryKey(),
  title: text().notNull(),
  url: text().notNull(),
  icon: text().notNull().default("ExternalLink"),
  color: text().notNull().default("bg-indigo-600"),
  logoKey: text("logo_key"),
  position: integer().notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Link = typeof links.$inferSelect;
