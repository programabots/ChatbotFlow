import {
  type User,
  type InsertUser,
  type PredefinedResponse,
  type InsertPredefinedResponse,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type BotSettings,
  type InsertBotSettings,
  type Analytics,
  type InsertAnalytics
} from "../shared/schema.js";

import { randomUUID } from "node:crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllPredefinedResponses(): Promise<PredefinedResponse[]>;
  getPredefinedResponse(id: string): Promise<PredefinedResponse | undefined>;
  createPredefinedResponse(response: InsertPredefinedResponse): Promise<PredefinedResponse>;
  updatePredefinedResponse(id: string, response: Partial<InsertPredefinedResponse>): Promise<PredefinedResponse | undefined>;
  deletePredefinedResponse(id: string): Promise<boolean>;
  searchResponsesByKeyword(keyword: string): Promise<PredefinedResponse[]>;

  getAllConversations(): Promise<Conversation[]>;
  getActiveConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;

  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  getBotSettings(): Promise<BotSettings>;
  updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings>;

  getTodayAnalytics(): Promise<Analytics | undefined>;
  getAnalyticsByDate(date: string): Promise<Analytics | undefined>;
  createOrUpdateAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private predefinedResponses = new Map<string, PredefinedResponse>();
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message>();
  private analytics = new Map<string, Analytics>();
  private botSettings: BotSettings;

  constructor() {
    this.botSettings = {
      id: randomUUID(),
      autoResponses: true,
      businessHours: true,
      autoHandoff: false,
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      outOfHoursMessage:
        "Gracias por contactarnos. Nuestro horario de atención es de 9:00 a 18:00. Te responderemos a la brevedad."
    };

    // Seed básico
    const pr1: PredefinedResponse = {
      id: randomUUID(),
      keywords: ["hola", "buenas", "saludo"],
      responseText: "¡Hola! 👋 ¿En qué podemos ayudarte?",
      category: "General",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.predefinedResponses.set(pr1.id, pr1);

    const today = new Date().toISOString().split("T")[0];
    this.analytics.set(today, {
      id: randomUUID(),
      date: today,
      totalConversations: 5,
      autoResponses: 3,
      handoffs: 1,
      avgResponseTime: 2000
    });
  }

  // Users
  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  async createUser(insert: InsertUser) {
    const id = randomUUID();
    const user: User = { id, username: insert.username, password: insert.password };
    this.users.set(id, user);
    return user;
  }

  // Predefined Responses
  async getAllPredefinedResponses() {
    return Array.from(this.predefinedResponses.values());
  }
  async getPredefinedResponse(id: string) {
    return this.predefinedResponses.get(id);
  }
  async createPredefinedResponse(insert: InsertPredefinedResponse) {
    const now = new Date();
    const item: PredefinedResponse = {
      id: randomUUID(),
      keywords: insert.keywords,
      responseText: insert.responseText,
      category: insert.category,
      isActive: insert.isActive,
      createdAt: now,
      updatedAt: now
    };
    this.predefinedResponses.set(item.id, item);
    return item;
  }
  async updatePredefinedResponse(id: string, patch: Partial<InsertPredefinedResponse>) {
    const cur = this.predefinedResponses.get(id);
    if (!cur) return undefined;
    const updated: PredefinedResponse = {
      ...cur,
      keywords: patch.keywords ?? cur.keywords,
      responseText: patch.responseText ?? cur.responseText,
      category: patch.category ?? cur.category,
      isActive: patch.isActive ?? cur.isActive,
      updatedAt: new Date()
    };
    this.predefinedResponses.set(id, updated);
    return updated;
  }
  async deletePredefinedResponse(id: string) {
    return this.predefinedResponses.delete(id);
  }
  async searchResponsesByKeyword(keyword: string) {
    const q = keyword.toLowerCase();
    return Array.from(this.predefinedResponses.values()).filter(r =>
      r.responseText.toLowerCase().includes(q) ||
      r.keywords.some(k => k.toLowerCase().includes(q))
    );
  }

  // Conversations
  async getAllConversations() {
    return Array.from(this.conversations.values())
      .sort((a, b) => +b.lastMessageAt - +a.lastMessageAt);
  }
  async getActiveConversations() {
    return (await this.getAllConversations()).filter(c => c.status === "active");
  }
  async getConversation(id: string) { return this.conversations.get(id); }
  async createConversation(insert: InsertConversation) {
    const id = randomUUID();
    const now = new Date();
    const conv: Conversation = {
      id,
      customerPhone: insert.customerPhone,
      customerName: insert.customerName,
      status: insert.status ?? "active",
      lastMessage: insert.lastMessage,
      lastMessageAt: now,
      unreadCount: insert.unreadCount ?? 0,
      createdAt: now
    };
    this.conversations.set(id, conv);
    return conv;
  }
  async updateConversation(id: string, patch: Partial<InsertConversation>) {
    const cur = this.conversations.get(id);
    if (!cur) return undefined;
    const updated: Conversation = {
      ...cur,
      customerPhone: patch.customerPhone ?? cur.customerPhone,
      customerName: patch.customerName ?? cur.customerName,
      status: patch.status ?? cur.status,
      lastMessage: patch.lastMessage ?? cur.lastMessage,
      unreadCount: patch.unreadCount ?? cur.unreadCount,
      lastMessageAt: patch.lastMessage ? new Date() : cur.lastMessageAt
    };
    this.conversations.set(id, updated);
    return updated;
  }

  // Messages
  async getMessagesByConversation(conversationId: string) {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => +a.timestamp - +b.timestamp);
  }
  async createMessage(insert: InsertMessage) {
    const id = randomUUID();
    const msg: Message = {
      id,
      conversationId: insert.conversationId,
      messageText: insert.messageText,
      messageType: insert.messageType,
      isFromBot: insert.isFromBot ?? false,
      timestamp: new Date()
    };
    this.messages.set(id, msg);
    // touch conversation
    const conv = this.conversations.get(insert.conversationId);
    if (conv) {
      conv.lastMessage = msg.messageText;
      conv.lastMessageAt = msg.timestamp;
      this.conversations.set(conv.id, conv);
    }
    return msg;
  }

  // Bot Settings
  async getBotSettings() { return this.botSettings; }
  async updateBotSettings(patch: Partial<InsertBotSettings>) {
    this.botSettings = {
      ...this.botSettings,
      ...patch
    } as BotSettings;
    return this.botSettings;
  }

  // Analytics
  async getTodayAnalytics() {
    const today = new Date().toISOString().split("T")[0];
    return this.analytics.get(today);
  }
  async getAnalyticsByDate(date: string) { return this.analytics.get(date); }
  async createOrUpdateAnalytics(insert: InsertAnalytics) {
    const existing = this.analytics.get(insert.date);
    if (existing) {
      const updated: Analytics = { ...existing, ...insert };
      this.analytics.set(insert.date, updated);
      return updated;
    }
    const a: Analytics = {
      id: randomUUID(),
      date: insert.date,
      totalConversations: insert.totalConversations ?? 0,
      autoResponses: insert.autoResponses ?? 0,
      handoffs: insert.handoffs ?? 0,
      avgResponseTime: insert.avgResponseTime ?? 0
    };
    this.analytics.set(a.date, a);
    return a;
  }
}

export const storage = new MemStorage();
