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

          // ✅ Configuración por defecto del bot (con todas las keys)
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

        // 🚧 Métodos a implementar
        async getUser(): Promise<User | undefined> { return undefined; }
        async getUserByUsername(): Promise<User | undefined> { return undefined; }
        async createUser(): Promise<User> { throw new Error("not implemented"); }

        async getAllPredefinedResponses(): Promise<PredefinedResponse[]> { return []; }
        async getPredefinedResponse(): Promise<PredefinedResponse | undefined> { return undefined; }
        async createPredefinedResponse(): Promise<PredefinedResponse> { throw new Error("not implemented"); }
        async updatePredefinedResponse(): Promise<PredefinedResponse | undefined> { return undefined; }
        async deletePredefinedResponse(): Promise<boolean> { return false; }
        async searchResponsesByKeyword(): Promise<PredefinedResponse[]> { return []; }

        async getAllConversations(): Promise<Conversation[]> { return []; }
        async getActiveConversations(): Promise<Conversation[]> { return []; }
        async getConversation(): Promise<Conversation | undefined> { return undefined; }
        async createConversation(): Promise<Conversation> { throw new Error("not implemented"); }
        async updateConversation(): Promise<Conversation | undefined> { return undefined; }

        async getMessagesByConversation(): Promise<Message[]> { return []; }
        async createMessage(): Promise<Message> { throw new Error("not implemented"); }

        async getBotSettings(): Promise<BotSettings> { return this.botSettings; }
        async updateBotSettings(): Promise<BotSettings> { return this.botSettings; }

        async getTodayAnalytics(): Promise<Analytics | undefined> { return undefined; }
        async getAnalyticsByDate(): Promise<Analytics | undefined> { return undefined; }
        async createOrUpdateAnalytics(): Promise<Analytics> { throw new Error("not imp
