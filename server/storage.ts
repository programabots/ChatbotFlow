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
} from "../shared/schema";   // ✅ corregido, antes era "@shared/schema"

import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Predefined Responses
  getAllPredefinedResponses(): Promise<PredefinedResponse[]>;
  getPredefinedResponse(id: string): Promise<PredefinedResponse | undefined>;
  createPredefinedResponse(response: InsertPredefinedResponse): Promise<PredefinedResponse>;
  updatePredefinedResponse(id: string, response: Partial<InsertPredefinedResponse>): Promise<PredefinedResponse | undefined>;
  deletePredefinedResponse(id: string): Promise<boolean>;
  searchResponsesByKeyword(keyword: string): Promise<PredefinedResponse[]>;

  // Conversations
  getAllConversations(): Promise<Conversation[]>;
  getActiveConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;

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
  private users: Map<string, User>;
  private predefinedResponses: Map<string, PredefinedResponse>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private botSettings: BotSettings;
  private analytics: Map<string, Analytics>;

  constructor() {
    this.users = new Map();
    this.predefinedResponses = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.analytics = new Map();

    // Default bot settings
    this.botSettings = {
      id: randomUUID(),
      autoResponses: true,
      businessHours: true,
      autoHandoff: false,
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      outOfHoursMessage: "Gracias por contactarnos. Nuestro horario de atención es de 9:00 a 18:00. Te responderemos a la brevedad."
    };
  }

  // ---------- Users ----------
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // ---------- Predefined Responses ----------
  async getAllPredefinedResponses(): Promise<PredefinedResponse[]> {
    return Array.from(this.predefinedResponses.values());
  }

  async getPredefinedResponse(id: string): Promise<PredefinedResponse | undefined> {
    return this.predefinedResponses.get(id);
  }

  async createPredefinedResponse(response: InsertPredefinedResponse): Promise<PredefinedResponse> {
    const id = randomUUID();
    const newResponse: PredefinedResponse = {
      id,
      keywords: response.keywords,
      responseText: response.responseText,
      category: response.category,
      isActive: response.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.predefinedResponses.set(id, newResponse);
    return newResponse;
  }

  async updatePredefinedResponse(id: string, response: Partial<InsertPredefinedResponse>): Promise<PredefinedResponse | undefined> {
    const existing = this.predefinedResponses.get(id);
    if (!existing) return undefined;

    const updated: PredefinedResponse = {
      ...existing,
      keywords: response.keywords ?? existing.keywords,
      responseText: response.responseText ?? existing.responseText,
      category: response.category ?? existing.category,
      isActive: response.isActive ?? existing.isActive,
      updatedAt: new Date()
    };
    this.predefinedResponses.set(id, updated);
    return updated;
  }

  async deletePredefinedResponse(id: string): Promise<boolean> {
    return this.predefinedResponses.delete(id);
  }

  async searchResponsesByKeyword(keyword: string): Promise<PredefinedResponse[]> {
    const responses = Array.from(this.predefinedResponses.values());
    return responses.filter(response => 
      response.keywords.some(k => k.toLowerCase().includes(keyword.toLowerCase())) ||
      response.responseText.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // ---------- Conversations ----------
  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  async getActiveConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.status === "active")
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = {
      id,
      customerPhone: conversation.customerPhone,
      customerName: conversation.customerName,
      status: conversation.status,
      lastMessage: conversation.lastMessage,
      unreadCount: conversation.unreadCount,
      createdAt: new Date(),
      lastMessageAt: new Date()
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;

    const updated: Conversation = { ...existing, ...conversation };
    this.conversations.set(id, updated);
    return updated;
  }

  // ---------- Messages ----------
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      id,
      conversationId: message.conversationId,
      messageText: message.messageText,
      messageType: message.messageType,
      isFromBot: message.isFromBot ?? false,
      timestamp: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // ---------- Bot Settings ----------
  async getBotSettings(): Promise<BotSettings> {
    return this.botSettings;
  }

  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings> {
    this.botSettings = { ...this.botSettings, ...settings };
    return this.botSettings;
  }

  // ---------- Analytics ----------
  async getTodayAnalytics(): Promise<Analytics | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.analytics.get(today);
  }

  async getAnalyticsByDate(date: string): Promise<Analytics | undefined> {
    return this.analytics.get(date);
  }

  async createOrUpdateAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const existing = this.analytics.get(analytics.date);
    if (existing) {
      const updated: Analytics = { ...existing, ...analytics };
      this.analytics.set(analytics.date, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newAnalytics: Analytics = { 
        id, 
        date: analytics.date,
        totalConversations: analytics.totalConversations ?? 0,
        autoResponses: analytics.autoResponses ?? 0,
        handoffs: analytics.handoffs ?? 0,
        avgResponseTime: analytics.avgResponseTime ?? 0
      };
      this.analytics.set(analytics.date, newAnalytics);
      return newAnalytics;
    }
  }
}

export const storage = new MemStorage();
