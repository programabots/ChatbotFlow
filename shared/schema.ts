import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const predefinedResponses = pgTable("predefined_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keywords: json("keywords").$type<string[]>().notNull(),
  responseText: text("response_text").notNull(),
  category: text("category").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPhone: text("customer_phone").notNull(),
  customerName: text("customer_name"),
  status: text("status").notNull().default("active"), // active, closed, transferred
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").notNull().default(sql`now()`),
  unreadCount: integer("unread_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  messageText: text("message_text").notNull(),
  messageType: text("message_type").notNull(), // incoming, outgoing, bot
  isFromBot: boolean("is_from_bot").notNull().default(false),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  autoResponses: boolean("auto_responses").notNull().default(true),
  businessHours: boolean("business_hours").notNull().default(true),
  autoHandoff: boolean("auto_handoff").notNull().default(false),
  businessHoursStart: text("business_hours_start").notNull().default("09:00"),
  businessHoursEnd: text("business_hours_end").notNull().default("18:00"),
  outOfHoursMessage: text("out_of_hours_message").notNull().default("Gracias por contactarnos. Nuestro horario de atención es de 9:00 a 18:00. Te responderemos a la brevedad."),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  totalConversations: integer("total_conversations").notNull().default(0),
  autoResponses: integer("auto_responses").notNull().default(0),
  handoffs: integer("handoffs").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0), // in seconds
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPredefinedResponseSchema = createInsertSchema(predefinedResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PredefinedResponse = typeof predefinedResponses.$inferSelect;
export type InsertPredefinedResponse = z.infer<typeof insertPredefinedResponseSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
