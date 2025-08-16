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
} from "@shared/schema";
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

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample predefined responses
    const sampleResponses: InsertPredefinedResponse[] = [
      {
        keywords: ["hola", "saludo", "buenos dias", "buenas tardes", "buenas noches"],
        responseText: "¡Hola! 👋 Gracias por contactarnos. ¿En qué podemos ayudarte hoy?",
        category: "General",
        isActive: true
      },
      {
        keywords: ["precios", "costos", "cuánto", "precio", "valor"],
        responseText: "Te comparto nuestros precios actualizados:\n• Producto A: $299 (20% desc.)\n• Producto B: $199 (15% desc.)\n• Producto C: $399 (25% desc.)\n\n¿Qué producto específico te interesa?",
        category: "Precios",
        isActive: true
      },
      {
        keywords: ["agente", "humano", "persona", "operador"],
        responseText: "Te estoy conectando con uno de nuestros agentes. Por favor espera un momento.",
        category: "Derivación",
        isActive: true
      },
      {
        keywords: ["horario", "horarios", "abierto", "atención"],
        responseText: "Nuestro horario de atención es:\n🕘 Lunes a Viernes: 9:00 AM - 6:00 PM\n🕘 Sábados: 9:00 AM - 2:00 PM\n❌ Domingos: Cerrado",
        category: "Información",
        isActive: true
      }
    ];

    sampleResponses.forEach(response => {
      const id = randomUUID();
      this.predefinedResponses.set(id, {
        id,
        ...response,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Sample conversations
    const sampleConversations: InsertConversation[] = [
      {
        customerPhone: "+5491123456789",
        customerName: "María González",
        status: "active",
        lastMessage: "Necesito ayuda con mi pedido",
        unreadCount: 3
      },
      {
        customerPhone: "+5491123456790",
        customerName: "Carlos Ruiz",
        status: "active",
        lastMessage: "¿Tienen envíos a provincia?",
        unreadCount: 1
      },
      {
        customerPhone: "+5491123456791",
        customerName: "Ana López",
        status: "active",
        lastMessage: "Información sobre garantías",
        unreadCount: 2
      }
    ];

    sampleConversations.forEach(conversation => {
      const id = randomUUID();
      this.conversations.set(id, {
        id,
        ...conversation,
        createdAt: new Date(),
        lastMessageAt: new Date()
      });
    });

    // Today's analytics
    const today = new Date().toISOString().split('T')[0];
    this.analytics.set(today, {
      id: randomUUID(),
      date: today,
      totalConversations: 127,
      autoResponses: 89,
      handoffs: 23,
      avgResponseTime: 2300 // 2.3 seconds in milliseconds
    });
  }

  // Users
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

  // Predefined Responses
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
      ...response,
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
      ...response,
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

  // Conversations
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
      ...conversation,
      createdAt: new Date(),
      lastMessageAt: new Date()
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;

    const updated: Conversation = {
      ...existing,
      ...conversation
    };
    this.conversations.set(id, updated);
    return updated;
  }

  // Messages
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      id,
      ...message,
      timestamp: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // Bot Settings
  async getBotSettings(): Promise<BotSettings> {
    return this.botSettings;
  }

  async updateBotSettings(settings: Partial<InsertBotSettings>): Promise<BotSettings> {
    this.botSettings = { ...this.botSettings, ...settings };
    return this.botSettings;
  }

  // Analytics
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
      const newAnalytics: Analytics = { id, ...analytics };
      this.analytics.set(analytics.date, newAnalytics);
      return newAnalytics;
    }
  }
}

export const storage = new MemStorage();
