// shared/schema.ts  (versión sin Drizzle/Zod)

export type User = {
  id: string;
  username: string;
  password: string;
};
export type InsertUser = Omit<User, "id">;

export type PredefinedResponse = {
  id: string;
  keywords: string[];
  responseText: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
export type InsertPredefinedResponse = Omit<PredefinedResponse, "id" | "createdAt" | "updatedAt">;

export type Conversation = {
  id: string;
  customerPhone: string;
  customerName?: string;
  status: "active" | "closed" | "transferred";
  lastMessage?: string;
  lastMessageAt: Date;
  unreadCount: number;
  createdAt: Date;
};
export type InsertConversation = Omit<Conversation, "id" | "createdAt" | "lastMessageAt">;

export type Message = {
  id: string;
  conversationId: string;
  messageText: string;
  messageType: "incoming" | "outgoing" | "bot";
  isFromBot: boolean;
  timestamp: Date;
};
export type InsertMessage = Omit<Message, "id" | "timestamp">;

export type BotSettings = {
  id: string;
  autoResponses: boolean;
  businessHours: boolean;
  autoHandoff: boolean;
  businessHoursStart: string; // "HH:mm"
  businessHoursEnd: string;   // "HH:mm"
  outOfHoursMessage: string;
};
export type InsertBotSettings = Partial<Omit<BotSettings, "id">>;

export type Analytics = {
  id: string;
  date: string; // YYYY-MM-DD
  totalConversations: number;
  autoResponses: number;
  handoffs: number;
  avgResponseTime: number; // ms
};
export type InsertAnalytics = Omit<Analytics, "id">;
