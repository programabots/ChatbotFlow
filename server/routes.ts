// server/routes.ts
import { Express, Request, Response } from "express";
import { MemStorage } from "./storage.js";

const storage = new MemStorage();

export async function registerRoutes(app: Express) {
  // ==== Users ====
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ==== Predefined Responses ====
  app.get("/api/responses", async (_req, res) => {
    const responses = await storage.getAllPredefinedResponses(); // ✅ corregido
    res.json(responses);
  });

  app.post("/api/responses", async (req, res) => {
    try {
      const resp = await storage.createPredefinedResponse(req.body);
      res.status(201).json(resp);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ==== Conversations ====
  app.get("/api/conversations", async (_req, res) => {
    const convos = await storage.getAllConversations(); // ✅ corregido
    res.json(convos);
  });

  app.post("/api/conversations", async (req, res) => {
    const convo = await storage.createConversation(req.body);
    res.status(201).json(convo);
  });

  app.get("/api/conversations/:id", async (req, res) => {
    const convo = await storage.getConversation(req.params.id);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    res.json(convo);
  });

  // ==== Messages ====
  app.get("/api/conversations/:id/messages", async (req, res) => {
    const msgs = await storage.getMessagesByConversation(req.params.id); // ✅ corregido
    res.json(msgs);
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const msg = await storage.createMessage({
        ...req.body,
        conversationId: req.params.id,
      });
      res.status(201).json(msg);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ==== Bot Settings ====
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getBotSettings();
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    const settings = await storage.updateBotSettings(req.body);
    res.json(settings);
  });

  // ==== Analytics ====
  app.get("/api/analytics", async (_req, res) => {
    const stats = await storage.getTodayAnalytics(); // ✅ corregido
    res.json(stats);
  });

  app.post("/api/analytics", async (req, res) => {
    const entry = await storage.createOrUpdateAnalytics(req.body); // ✅ corregido
    res.status(201).json(entry);
  });

  return app;
}
