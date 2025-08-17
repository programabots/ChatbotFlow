// server/storage.ts
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
  type InsertAnalytics,
} from "../shared/schema.js";

import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Predefined Responses
  getAllPredefinedResponses(): Promise<PredefinedResponse[]>;
  getPredefinedResponse(id: string): Promise<PredefinedResponse | undefined>;
  createPredefinedResponse(
    response: InsertPredefinedResponse
  ): Promise<PredefinedResponse>;
  updatePredefinedResponse(
    id: string,
    response: Partial<InsertPredefinedResponse>
  ): Promise<PredefinedResponse | undefined>;
  deletePredefinedResponse(id: string): Promise<boolean>;
  searchResponsesByKeyword(keyword: string): Promise<PredefinedResponse[]>;

  // Conversations
  getAllConversations(): Promise<Conversation[]>;
  getActiveConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(
    id: string,
    conversation: Partial<InsertConversation>
  ): Promise<Conversation | undefined>;

  // Messages
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Bot Settings
  getBotSettings(): Promise<BotSettings>;
  updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings>;

  // Analytics
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

  private botSettings: BotSettings = {
    id: randomUUID(),
    autoResponses: true,
    businessHours: true,
    autoHandoff: false,
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00",
    outOfHoursMessage:
      "Gracias por contactarnos. Nuestro horario de atención es de 9:00 a 18:00. Te responderemos a la brevedad.",
  };

  constructor() {
    // datos de ejemplo mínimos
    const pr1: PredefinedResponse = {
      id: randomUUID(),
      keywords: ["hola", "saludo"],
      responseText: "¡Hola! 👋 ¿En qué puedo ayudarte?",
      category: "General",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.predefinedResponses.set(pr1.id, pr1);

    const c1: Conversation = {
      id: randomUUID(),
      customerPhone: "+5491112345678",
      customerName: "Ejemplo",
      status: "active",
      lastMessage: "Hola",
      lastMessageAt: new Date(),
      unreadCount: 1,
      createdAt: new Date(),
    };
    this.conversations.set(c1.id, c1);
  }

  // ---------- Users ----------
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const created: User = { id: randomUUID(), username: user.username, password: user.password };
    this.users.set(created.id, created);
    return created;
  }

  // ---------- Predefined Responses ----------
  async getAllPredefinedResponses(): Promise<PredefinedResponse[]> {
    return Array.from(this.predefinedResponses.values());
  }

  async getPredefinedResponse(id: string): Promise<PredefinedResponse | undefined> {
    return this.predefinedResponses.get(id);
  }

  async createPredefinedResponse(
    response: InsertPredefinedResponse
  ): Promise<PredefinedResponse> {
    const created: PredefinedResponse = {
      id: randomUUID(),
      keywords: response.keywords,
      responseText: response.responseText,
      category: response.category,
      isActive: response.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.predefinedResponses.set(created.id, created);
    return created;
  }

  async updatePredefinedResponse(
    id: string,
    response: Partial<InsertPredefinedResponse>
  ): Promise<PredefinedResponse | undefined> {
    const existing = this.predefinedResponses.get(id);
    if (!existing) return undefined;
    const updated: PredefinedResponse = {
      ...existing,
      keywords: response.keywords ?? existing.keywords,
      responseText: response.responseText ?? existing.responseText,
      category: response.category ?? existing.category,
      isActive: response.isActive ?? existing.isActive,
      updatedAt: new Date(),
    };
    this.predefinedResponses.set(id, updated);
    return updated;
  }

  async deletePredefinedResponse(id: string): Promise<boolean> {
    return this.predefinedResponses.delete(id);
  }

  async searchResponsesByKeyword(keyword: string): Promise<PredefinedResponse[]> {
    const q = keyword.toLowerCase();
    return Array.from(this.predefinedResponses.values()).filter(
      (r) =>
        r.responseText.toLowerCase().includes(q) ||
        r.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }

  // ---------- Conversations ----------
  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );
  }

  async getActiveConversations(): Promise<Conversation[]> {
    return (await this.getAllConversations()).filter((c) => c.status === "active");
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const now = new Date();
    const created: Conversation = {
      id: randomUUID(),
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      status: data.status ?? "active", // ⚠️ sin "open"
      lastMessage: data.lastMessage,
      lastMessageAt: now, // lo seteamos nosotros
      unreadCount: data.unreadCount ?? 0,
      createdAt: now,
    };
    this.conversations.set(created.id, created);
    return created;
  }

  async updateConversation(
    id: string,
    patch: Partial<InsertConversation>
  ): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;

    const updated: Conversation = {
      ...existing,
      customerPhone: patch.customerPhone ?? existing.customerPhone,
      customerName: patch.customerName ?? existing.customerName,
      status: patch.status ?? existing.status, // ⚠️ sólo "active" | "closed" | "transferred"
      lastMessage: patch.lastMessage ?? existing.lastMessage,
      lastMessageAt:
        patch.lastMessage !== undefined ? new Date() : existing.lastMessageAt,
      unreadCount:
        patch.unreadCount !== undefined ? patch.unreadCount : existing.unreadCount,
    };
    this.conversations.set(id, updated);
    return updated;
  }

  // ---------- Messages ----------
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const created: Message = {
      id: randomUUID(),
      conversationId: message.conversationId,
      messageText: message.messageText,
      messageType: message.messageType,
      isFromBot: message.isFromBot ?? false,
      timestamp: new Date(),
    };
    this.messages.set(created.id, created);

    // actualizar conversación relacionada
    const convo = this.conversations.get(message.conversationId);
    if (convo) {
      convo.lastMessage = message.messageText;
      convo.lastMessageAt = new Date();
      // si el mensaje es entrante y no es del bot, incrementa unread
      if (message.messageType === "incoming" && !message.isFromBot) {
        convo.unreadCount = (convo.unreadCount ?? 0) + 1;
      }
      this.conversations.set(convo.id, convo);
    }

    return created;
  }

  // ---------- Bot Settings ----------
  async getBotSettings(): Promise<BotSettings> {
    return this.botSettings;
  }

  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings> {
    this.botSettings = {
      ...this.botSettings,
      ...settings,
    } as BotSettings;
    return this.botSettings;
  }

  // ---------- Analytics ----------
  async getTodayAnalytics(): Promise<Analytics | undefined> {
    const today = new Date().toISOString().slice(0, 10);
    return this.analytics.get(today);
  }

  async getAnalyticsByDate(date: string): Promise<Analytics | undefined> {
    return this.analytics.get(date);
  }

  async createOrUpdateAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const prev = this.analytics.get(analytics.date);
    if (prev) {
      const merged: Analytics = {
        ...prev,
        ...analytics,
      };
      this.analytics.set(analytics.date, merged);
      return merged;
    }
    const created: Analytics = {
      id: randomUUID(),
      date: analytics.date,
      totalConversations: analytics.totalConversations ?? 0,
      autoResponses: analytics.autoResponses ?? 0,
      handoffs: analytics.handoffs ?? 0,
      avgResponseTime: analytics.avgResponseTime ?? 0,
    };
    this.analytics.set(created.date, created);
    return created;
  }
}

export const storage = new MemStorage();
