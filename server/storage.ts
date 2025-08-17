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

import { randomUUID } from "crypto";

// Interfaces de almacenamiento
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
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
}

// Implementación en memoria
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

    // Configuración por defecto del bot
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

  // === Users ===
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = { id: randomUUID(), ...user };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // === Predefined Responses ===
  async getAllPredefinedResponses(): Promise<PredefinedResponse[]> {
    return Array.from(this.predefinedResponses.values());
  }

  async getPredefinedResponse(id: string): Promise<PredefinedResponse | undefined> {
    return this.predefinedResponses.get(id);
  }

  async createPredefinedResponse(response: InsertPredefinedResponse): Promise<PredefinedResponse> {
    const newResp: PredefinedResponse = { id: randomUUID(), ...response };
    this.predefinedResponses.set(newResp.id, newResp);
    return newResp;
  }

  async updatePredefinedResponse(id: string, response: Partial<InsertPredefinedResponse>): Promise<PredefinedResponse | undefined> {
    const existing = this.predefinedResponses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...response };
    this.predefinedResponses.set(id, updated);
    return updated;
  }

  async deletePredefinedResponse(id: string): Promise<boolean> {
    return this.predefinedResponses.delete(id);
  }

  async searchResponsesByKeyword(keyword: string): Promise<PredefinedResponse[]> {
    return Array.from(this.predefinedResponses.values()).filter(r =>
      r.text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // === Conversations ===
  async getAllConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getActiveConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.active);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const newConvo: Conversation = { id: randomUUID(), ...conversation };
    this.conversations.set(newConvo.id, newConvo);
    return newConvo;
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...conversation };
    this.conversations.set(id, updated);
    return updated;
  }

  // === Messages ===
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(m => m.conversationId === conversationId);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const newMsg: Message = { id: randomUUID(), ...message };
    this.messages.set(newMsg.id, newMsg);
    return newMsg;
  }

  // === Bot Settings ===
  async getBotSettings(): Promise<BotSettings> {
    return this.botSettings;
  }

  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings> {
    this.botSettings = { ...this.botSettings, ...settings };
    return this.botSettings;
  }

  // === Analytics ===
  async getTodayAnalytics(): Promise<Analytics | undefined> {
    const today = new Date().toISOString().split("T")[0];
    return this.analytics.get(today);
  }

  async getAnalyticsByDate(date: string): Promise<Analytics | undefined> {
    return this.analytics.get(date);
  }

  async createOrUpdateAnalytics(entry: InsertAnalytics): Promise<Analytics> {
    const existing = this.analytics.get(entry.date);
    const updated: Analytics = existing
      ? { ...existing, ...entry }
      : { id: randomUUID(), ...entry };
    this.analytics.set(entry.date, updated);
    return updated;
  }

  async createAnalytics(entry: InsertAnalytics): Promise<Analytics> {
    return this.createOrUpdateAnalytics(entry);
  }
}
