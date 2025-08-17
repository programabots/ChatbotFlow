import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertPredefinedResponseSchema, insertBotSettingsSchema, insertMessageSchema } from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Predefined Responses endpoints
  app.get("/api/responses", async (req, res) => {
    try {
      const responses = await storage.getAllPredefinedResponses();
      res.json(responses);
    } catch {
      res.status(500).json({ message: "Error fetching responses" });
    }
  });

  app.post("/api/responses", async (req, res) => {
    try {
      const validatedData = insertPredefinedResponseSchema.parse(req.body);
      const response = await storage.createPredefinedResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.issues });
      } else {
        res.status(500).json({ message: "Error creating response" });
      }
    }
  });

  app.put("/api/responses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPredefinedResponseSchema.partial().parse(req.body);
      const response = await storage.updatePredefinedResponse(id, validatedData);
      if (!response) return res.status(404).json({ message: "Response not found" });
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.issues });
      } else {
        res.status(500).json({ message: "Error updating response" });
      }
    }
  });

  app.delete("/api/responses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePredefinedResponse(id);
      if (!deleted) return res.status(404).json({ message: "Response not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting response" });
    }
  });

  // Conversations
  app.get("/api/conversations", async (_req, res) => {
    try {
      res.json(await storage.getAllConversations());
    } catch {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  app.get("/api/conversations/active", async (_req, res) => {
    try {
      res.json(await storage.getActiveConversations());
    } catch {
      res.status(500).json({ message: "Error fetching active conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      res.json(await storage.getMessagesByConversation(req.params.id));
    } catch {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // Settings
  app.get("/api/settings", async (_req, res) => {
    try {
      res.json(await storage.getBotSettings());
    } catch {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validated = insertBotSettingsSchema.partial().parse(req.body);
      res.json(await storage.updateBotSettings(validated));
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.issues });
      } else {
        res.status(500).json({ message: "Error updating settings" });
      }
    }
  });

  // Analytics
  app.get("/api/analytics/today", async (_req, res) => {
    try {
      const analytics = await storage.getTodayAnalytics();
      if (!analytics) return res.status(404).json({ message: "No analytics data for today" });
      res.json(analytics);
    } catch {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  app.get("/api/analytics/:date", async (req, res) => {
    try {
      const analytics = await storage.getAnalyticsByDate(req.params.date);
      if (!analytics) return res.status(404).json({ message: "No analytics data for this date" });
      res.json(analytics);
    } catch {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  // Webhooks
  app.post("/api/webhook/whatsapp", async (req, res) => {
    try {
      const securityToken = process.env.SECURITY_TOKEN;
      const providedToken = req.headers["x-security-token"] || req.query.security_token;
      if (securityToken && providedToken !== securityToken) {
        return res.status(403).json({ error: "Token de seguridad inválido" });
      }

      const webhookData = req.body;
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";
      if (req.query["hub.verify_token"] === verifyToken) {
        res.send(req.query["hub.challenge"]);
        return;
      }

      if (webhookData.entry?.[0]?.changes?.[0]?.value?.messages) {
        const message = webhookData.entry[0].changes[0].value.messages[0];
        const customerPhone = message.from;
        const messageText = message.text?.body ?? "";

        let conversation = (await storage.getAllConversations()).find(
          (c) => c.customerPhone === customerPhone
        );

        if (!conversation) {
          conversation = await storage.createConversation({
            customerPhone,
            customerName: `Customer ${customerPhone.slice(-4)}`,
            status: "active",
            lastMessage: messageText,
            unreadCount: 1,
          });
        }

        await storage.createMessage({
          conversationId: conversation.id,
          messageText,
          messageType: "incoming",
          isFromBot: false,
        });

        const botSettings = await storage.getBotSettings();
        if (botSettings.autoResponses) {
          const responses = await storage.searchResponsesByKeyword(messageText);
          if (responses.length) {
            const botResponse = responses[0];

            await storage.createMessage({
              conversationId: conversation.id,
              messageText: botResponse.responseText,
              messageType: "outgoing",
              isFromBot: true,
            });

            await storage.updateConversation(conversation.id, {
              lastMessage: botResponse.responseText,
              unreadCount: 0,
            });

            console.log(`Bot response: ${botResponse.responseText}`);
          }
        }
      }

      res.status(200).send();
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook processing error" });
    }
  });

  app.post("/api/x7f2e9a1b/webhook", async (req, res) => {
    try {
      const webhookData = req.body;

      if (req.query["hub.verify_token"]) {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";
        if (req.query["hub.verify_token"] === verifyToken) {
          res.send(req.query["hub.challenge"]);
          return;
        }
      }

      if (webhookData.entry?.[0]?.changes?.[0]?.value?.messages) {
        const message = webhookData.entry[0].changes[0].value.messages[0];
        const customerPhone = message.from;
        const messageText = message.text?.body ?? "";

        let conversation = (await storage.getAllConversations()).find(
          (c) => c.customerPhone === customerPhone
        );

        if (!conversation) {
          conversation = await storage.createConversation({
            customerPhone,
            customerName: `Customer ${customerPhone.slice(-4)}`,
            status: "active",
            lastMessage: messageText,
            unreadCount: 1,
          });
        }

        await storage.createMessage({
          conversationId: conversation.id,
          messageText,
          messageType: "incoming",
          isFromBot: false,
        });

        const botSettings = await storage.getBotSettings();
        if (botSettings.autoResponses) {
          const responses = await storage.searchResponsesByKeyword(messageText);
          if (responses.length) {
            const botResponse = responses[0];

            await storage.createMessage({
              conversationId: conversation.id,
              messageText: botResponse.responseText,
              messageType: "outgoing",
              isFromBot: true,
            });

            await storage.updateConversation(conversation.id, {
              lastMessage: botResponse.responseText,
              unreadCount: 0,
            });

            console.log(`Bot response (secure): ${botResponse.responseText}`);
          }
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error procesando webhook seguro:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Test message endpoint
  app.post("/api/test-message", async (req, res) => {
    try {
      const { message } = req.body;
      const responses = await storage.searchResponsesByKeyword(message);
      if (responses.length) {
        res.json({ response: responses[0].responseText, category: responses[0].category });
      } else {
        res.json({
          response:
            "Lo siento, no tengo una respuesta automática para esa consulta. Te conectaré con un agente humano.",
          category: "Derivación",
        });
      }
    } catch {
      res.status(500).json({ message: "Error processing test message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
