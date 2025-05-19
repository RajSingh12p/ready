import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Discord servers table
export const servers = pgTable("servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Roles table
export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  serverId: text("server_id").notNull().references(() => servers.id),
  name: text("name").notNull(),
  color: text("color"),
  position: integer("position").notNull(),
});

// DM logs table
export const dmLogs = pgTable("dm_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  roleId: text("role_id").notNull(),
  roleName: text("role_name").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull(), // 'sent', 'failed'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Bot configuration table
export const botConfig = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  commandPrefix: text("command_prefix").notNull().default("!"),
  logLevel: text("log_level").notNull().default("info"),
  serverPort: integer("server_port").notNull().default(5000),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertServerSchema = createInsertSchema(servers).pick({
  id: true,
  name: true,
  ownerId: true,
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  id: true,
  serverId: true,
  name: true,
  color: true,
  position: true,
});

export const insertDmLogSchema = createInsertSchema(dmLogs).pick({
  userId: true,
  username: true,
  roleId: true,
  roleName: true,
  message: true,
  status: true,
});

export const insertBotConfigSchema = createInsertSchema(botConfig).pick({
  commandPrefix: true,
  logLevel: true,
  serverPort: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertDmLog = z.infer<typeof insertDmLogSchema>;
export type DmLog = typeof dmLogs.$inferSelect;

export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type BotConfig = typeof botConfig.$inferSelect;
