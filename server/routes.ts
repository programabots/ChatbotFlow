// server/routes.ts
import { type Express, type Request, type Response } from "express";
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
    const responses = await storage.getAllPredefinedResponses();
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

  app.put("/api/responses/:id", async (req, res) => {
    const updated = await storage.updatePredefinedResponse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Response not found" });
    res.json(updated);
  });

  app.delete("/api/responses/:id", async (req, res) => {
    const ok = await storage.deletePredefinedResponse(req.params.id);
    if (!ok) return res.status(404).json({ message: "Response not found" });
    res.status(204).send();
  });

  // ==== Conversations ====
  app.get("/api/conversations", async (_req, res) => {
    const convos = await storage.getAllConversations();
    res.json(convos);
  });

  app.get("/api/conversations/active", async (_req, res) => {
    const convos = await storage.getActiveConversations();
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
    const msgs = await storage.getMessagesByConversation(req.params.id);
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
  app.get("/api/analytics/:date", async (req, res) => {
    const entry = await storage.getAnalyticsByDate(req.params.date);
    if (!entry) return res.status(404).json({ message: "No analytics for date" });
    res.json(entry);
  });

  app.get("/api/analytics/today", async (_req, res) => {
    const entry = await storage.getTodayAnalytics();
    if (!entry) return res.status(404).json({ message: "No analytics for today" });
    res.json(entry);
  });

  app.post("/api/analytics", async (req, res) => {
    const entry = await storage.createOrUpdateAnalytics(req.body);
    res.status(201).json(entry);
  });

  return app;
}
