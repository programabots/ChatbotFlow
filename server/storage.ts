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
} from "../shared/schema.js";   // importante: con extensión .js

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
  private users = new Map<string, User>();
  private predefinedResponses = new Map<string, PredefinedResponse>();
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message>();
  private botSettings: BotSettings;
  private analytics = new Map<string, Analytics>();

  constructor() {
    this.botSettings = {
      id: randomUUID(),
      autoResponses: true,
      businessHours: true,
      autoHandoff: false,
    };
  }

  // Users
  async getUser(id: string) {
    return this.users.get(id);
  }
  async getUserByUsername(username: string) {
    return [...this.users.values()].find(u => u.username === username);
  }
  async createUser(user: InsertUser) {
    const newUser: User = { id: randomUUID(), ...user };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Predefined Responses
  async getAllPredefinedResponses() {
    return [...this.predefinedResponses.values()];
  }
  async getPredefinedResponse(id: string) {
    return this.predefinedResponses.get(id);
  }
  async createPredefinedResponse(response: InsertPredefinedResponse) {
    const newResp: PredefinedResponse = { id: randomUUID(), ...response };
    this.predefinedResponses.set(newResp.id, newResp);
    return newResp;
  }
  async updatePredefinedResponse(id: string, response: Partial<InsertPredefinedResponse>) {
    const existing = this.predefinedResponses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...response };
    this.predefinedResponses.set(id, updated);
    return updated;
  }
  async deletePredefinedResponse(id: string) {
    return this.predefinedResponses.delete(id);
  }
  async searchResponsesByKeyword(keyword: string) {
    return [...this.predefinedResponses.values()].filter(r =>
      r.responseText?.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Conversations
  async getAllConversations() {
    return [...this.conversations.values()];
  }
  async getActiveConversations() {
    return [...this.conversations.values()].filter(c => c.active);
  }
  async getConversation(id: string) {
    return this.conversations.get(id);
  }
  async createConversation(conversation: InsertConversation) {
    const newConv: Conversation = { id: randomUUID(), active: true, ...conversation };
    this.conversations.set(newConv.id, newConv);
    return newConv;
  }
  async updateConversation(id: string, conversation: Partial<InsertConversation>) {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...conversation };
    this.conversations.set(id, updated);
    return updated;
  }

  // Messages
  async getMessagesByConversation(conversationId: string) {
    return [...this.messages.values()].filter(m => m.conversationId === conversationId);
  }
  async createMessage(message: InsertMessage) {
    const newMsg: Message = { id: randomUUID(), ...message };
    this.messages.set(newMsg.id, newMsg);
    return newMsg;
  }

  // Bot Settings
  async getBotSettings() {
    return this.botSettings;
  }
  async updateBotSettings(settings: Partial<InsertBotSettings>) {
    this.botSettings = { ...this.botSettings, ...settings };
    return this.botSettings;
  }

  // Analytics
  async getTodayAnalytics() {
    const today = new Date().toISOString().split("T")[0];
    return this.analytics.get(today);
  }
  async getAnalyticsByDate(date: string) {
    return this.analytics.get(date);
  }
  async createOrUpdateAnalytics(analytics: InsertAnalytics) {
    const date = analytics.date;
    const existing = this.analytics.get(date);
    if (existing) {
      const updated = { ...existing, ...analytics };
      this.analytics.set(date, updated);
      return updated;
    }
    const newAnalytics: Analytics = { id: randomUUID(), ...analytics };
    this.analytics.set(date, newAnalytics);
    return newAnalytics;
  }
}

// 👉 instancia que usarás en routes.ts
export const storage: IStorage = new MemStorage();
