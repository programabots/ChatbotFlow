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
} from "../shared/schema.js";   // ✅ importante: con extensión .js

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
      autoHandoff: false
    };
  }

  // ✅ después de esto seguís implementando tus métodos…
}
