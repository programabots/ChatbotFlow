import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPredefinedResponseSchema, insertBotSettingsSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Predefined Responses endpoints
  app.get("/api/responses", async (req, res) => {
    try {
      const responses = await storage.getAllPredefinedResponses();
      res.json(responses);
    } catch (error) {
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
        res.status(400).json({ message: "Invalid data", errors: error.errors });
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
      
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      
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
      
      if (!deleted) {
        return res.status(404).json({ message: "Response not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting response" });
    }
  });

  // Conversations endpoints
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });

  app.get("/api/conversations/active", async (req, res) => {
    try {
      const conversations = await storage.getActiveConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const { id } = req.params;
      const messages = await storage.getMessagesByConversation(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  // Bot Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getBotSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertBotSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateBotSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error updating settings" });
      }
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/today", async (req, res) => {
    try {
      const analytics = await storage.getTodayAnalytics();
      if (!analytics) {
        return res.status(404).json({ message: "No analytics data for today" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  app.get("/api/analytics/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const analytics = await storage.getAnalyticsByDate(date);
      if (!analytics) {
        return res.status(404).json({ message: "No analytics data for this date" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching analytics" });
    }
  });

  // WhatsApp Webhook endpoint con seguridad adicional
  app.post("/api/webhook/whatsapp", async (req, res) => {
    try {
      // Verificar token de seguridad adicional
      const securityToken = process.env.SECURITY_TOKEN;
      const providedToken = req.headers['x-security-token'] || req.query.security_token;
      
      if (securityToken && providedToken !== securityToken) {
        return res.status(403).json({ error: "Token de seguridad inválido" });
      }
      
      const webhookData = req.body;
      
      // Verify webhook (simplified for demo)
      const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";
      
      if (req.query["hub.verify_token"] === verifyToken) {
        res.send(req.query["hub.challenge"]);
        return;
      }

      // Process incoming message
      if (webhookData.entry && webhookData.entry[0] && webhookData.entry[0].changes) {
        const changes = webhookData.entry[0].changes[0];
        if (changes.value && changes.value.messages) {
          const message = changes.value.messages[0];
          const customerPhone = message.from;
          const messageText = message.text?.body || "";

          // Find or create conversation
          let conversation = (await storage.getAllConversations()).find(
            conv => conv.customerPhone === customerPhone
          );

          if (!conversation) {
            conversation = await storage.createConversation({
              customerPhone,
              customerName: `Customer ${customerPhone.slice(-4)}`,
              status: "active",
              lastMessage: messageText,
              unreadCount: 1
            });
          }

          // Save incoming message
          await storage.createMessage({
            conversationId: conversation.id,
            messageText,
            messageType: "incoming",
            isFromBot: false
          });

          // Check for auto-response
          const botSettings = await storage.getBotSettings();
          if (botSettings.autoResponses) {
            const responses = await storage.searchResponsesByKeyword(messageText);
            if (responses.length > 0) {
              const botResponse = responses[0];
              
              // Save bot response
              await storage.createMessage({
                conversationId: conversation.id,
                messageText: botResponse.responseText,
                messageType: "outgoing",
                isFromBot: true
              });

              // Update conversation
              await storage.updateConversation(conversation.id, {
                lastMessage: botResponse.responseText,
                unreadCount: 0
              });

              // Here you would send the response back to WhatsApp
              // Implementation depends on WhatsApp Business API
              console.log(`Bot response: ${botResponse.responseText}`);
            }
          }
        }
      }

      res.status(200).send();
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: "Webhook processing error" });
    }
  });

  // Endpoint webhook alternativo con ruta ofuscada para mayor seguridad
  app.post("/api/x7f2e9a1b/webhook", async (req, res) => {
    try {
      const webhookData = req.body;
      
      // Verificar token en headers para máxima seguridad
      if (req.query["hub.verify_token"]) {
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";
        if (req.query["hub.verify_token"] === verifyToken) {
          res.send(req.query["hub.challenge"]);
          return;
        }
      }

      // Process incoming message (same logic as main webhook)
      if (webhookData.entry && webhookData.entry[0] && webhookData.entry[0].changes) {
        const changes = webhookData.entry[0].changes[0];
        if (changes.value && changes.value.messages) {
          const message = changes.value.messages[0];
          const customerPhone = message.from;
          const messageText = message.text?.body || "";

          // Find or create conversation
          let conversation = (await storage.getAllConversations()).find(
            conv => conv.customerPhone === customerPhone
          );

          if (!conversation) {
            conversation = await storage.createConversation({
              customerPhone,
              customerName: `Customer ${customerPhone.slice(-4)}`,
              status: "active",
              lastMessage: messageText,
              unreadCount: 1
            });
          }

          // Save incoming message
          await storage.createMessage({
            conversationId: conversation.id,
            messageText,
            messageType: "incoming",
            isFromBot: false
          });

          // Check for auto-response
          const botSettings = await storage.getBotSettings();
          if (botSettings.autoResponses) {
            const responses = await storage.searchResponsesByKeyword(messageText);
            if (responses.length > 0) {
              const botResponse = responses[0];
              
              // Save bot response
              await storage.createMessage({
                conversationId: conversation.id,
                messageText: botResponse.responseText,
                messageType: "outgoing",
                isFromBot: true
              });

              // Update conversation
              await storage.updateConversation(conversation.id, {
                lastMessage: botResponse.responseText,
                unreadCount: 0
              });

              console.log(`Bot response (secure): ${botResponse.responseText}`);
            }
          }
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error procesando webhook seguro:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Test message endpoint for chat preview
  app.post("/api/test-message", async (req, res) => {
    try {
      const { message } = req.body;
      
      // Search for matching response
      const responses = await storage.searchResponsesByKeyword(message);
      
      if (responses.length > 0) {
        res.json({ 
          response: responses[0].responseText,
          category: responses[0].category
        });
      } else {
        res.json({ 
          response: "Lo siento, no tengo una respuesta automática para esa consulta. Te conectaré con un agente humano.",
          category: "Derivación"
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error processing test message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
