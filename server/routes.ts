import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users (mínimo)
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ message: e?.message ?? "Invalid user" });
    }
  });

  // Predefined Responses
  app.get("/api/responses", async (_req, res) => {
    res.json(await storage.getAllPredefinedResponses());
  });

  app.post("/api/responses", async (req, res) => {
    try {
      const created = await storage.createPredefinedResponse(req.body);
      res.status(201).json(created);
    } catch (e: any) {
      res.status(400).json({ message: e?.message ?? "Invalid response" });
    }
  });

  // Conversations
  app.get("/api/conversations", async (_req, res) => {
    res.json(await storage.getAllConversations());
  });

  app.get("/api/conversations/active", async (_req, res) => {
    res.json(await storage.getActiveConversations());
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    res.json(await storage.getMessagesByConversation(req.params.id));
  });

  app.post("/api/conversations", async (req, res) => {
    res.status(201).json(await storage.createConversation(req.body));
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    const msg = await storage.createMessage({ ...req.body, conversationId: req.params.id });
    res.status(201).json(msg);
  });

  // Settings
  app.get("/api/settings", async (_req, res) => {
    res.json(await storage.getBotSettings());
  });

  app.put("/api/settings", async (req, res) => {
    res.json(await storage.updateBotSettings(req.body));
  });

  // Analytics
  app.get("/api/analytics", async (_req, res) => {
    const today = await storage.getTodayAnalytics();
    res.json(today ?? []);
  });

  app.post("/api/analytics", async (req, res) => {
    const created = await storage.createOrUpdateAnalytics(req.body);
    res.status(201).json(created);
  });

  // health
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  const httpServer = createServer(app);
  return httpServer;
}
