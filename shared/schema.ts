// Users
export interface User {
  id: string;
  username: string;
  password: string;
}
export interface InsertUser {
  username: string;
  password: string;
}

// Predefined Responses
export interface PredefinedResponse {
  id: string;
  keywords: string[];
  responseText: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface InsertPredefinedResponse {
  keywords: string[];
  responseText: string;
  category: string;
  isActive: boolean;
}

// Conversations
export type ConversationStatus = "active" | "closed" | "transferred";

export interface Conversation {
  id: string;
  customerPhone: string;
  customerName?: string;
  status: ConversationStatus;
  lastMessage?: string;
  lastMessageAt: Date;
  unreadCount: number;
  createdAt: Date;
}
export interface InsertConversation {
  customerPhone: string;
  customerName?: string;
  status?: ConversationStatus;
  lastMessage?: string;
  unreadCount?: number;
}

// Messages
export type MessageType = "incoming" | "outgoing" | "bot";

export interface Message {
  id: string;
  conversationId: string;
  messageText: string;
  messageType: MessageType;
  isFromBot: boolean;
  timestamp: Date;
}
export interface InsertMessage {
  conversationId: string;
  messageText: string;
  messageType: MessageType;
  isFromBot?: boolean;
}

// Bot Settings
export interface BotSettings {
  id: string;
  autoResponses: boolean;
  businessHours: boolean;
  autoHandoff: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  outOfHoursMessage: string;
}
export interface InsertBotSettings {
  autoResponses?: boolean;
  businessHours?: boolean;
  autoHandoff?: boolean;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  outOfHoursMessage?: string;
}

// Analytics
export interface Analytics {
  id: string;
  date: string; // YYYY-MM-DD
  totalConversations: number;
  autoResponses: number;
  handoffs: number;
  avgResponseTime: number; // ms
}
export interface InsertAnalytics {
  date: string;
  totalConversations?: number;
  autoResponses?: number;
  handoffs?: number;
  avgResponseTime?: number;
}
