import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: string;
}

interface TestMessageResponse {
  response: string;
  category: string;
}

export default function ChatPreview() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hola, quisiera información sobre sus productos",
      isBot: false,
      timestamp: "14:23"
    },
    {
      id: "2", 
      text: "¡Hola! 👋 Gracias por contactarnos. Te ayudo con información sobre nuestros productos.\n\nElige una opción:\n1️⃣ Catálogo general\n2️⃣ Precios y ofertas\n3️⃣ Hablar con agente",
      isBot: true,
      timestamp: "14:23"
    },
    {
      id: "3",
      text: "2",
      isBot: false,
      timestamp: "14:24"
    },
    {
      id: "4",
      text: "Perfecto! 💰 Aquí tienes nuestros precios y ofertas actuales:\n\n• Producto A: $299 (20% desc.)\n• Producto B: $199 (15% desc.)\n• Producto C: $399 (25% desc.)\n\n¿Te interesa alguno en particular?",
      isBot: true,
      timestamp: "14:24"
    }
  ]);

  const [testMessage, setTestMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const testMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/test-message", { message });
      return response.json() as Promise<TestMessageResponse>;
    },
    onSuccess: (data) => {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        text: testMessage,
        isBot: false,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      // Add bot response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: data.response,
        isBot: true,
        timestamp: new Date().toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      setMessages(prev => [...prev, userMessage, botMessage]);
      setTestMessage("");
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    setIsTyping(true);
    testMessageMutation.mutate(testMessage);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Vista Previa del Chat</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Simulación en tiempo real</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="h-96 bg-gradient-to-b from-gray-50 to-gray-100 p-4 overflow-y-auto">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex mb-4 ${message.isBot ? 'justify-end' : ''}`}
              data-testid={`message-${message.id}`}
            >
              <div className={`rounded-lg px-4 py-2 max-w-xs ${
                message.isBot 
                  ? 'bg-whatsapp-500 text-white' 
                  : 'bg-white shadow-sm'
              }`}>
                <p className={`whitespace-pre-line ${message.isBot ? 'text-white' : 'text-gray-800'}`}>
                  {message.text}
                </p>
                <span className={`text-xs ${
                  message.isBot ? 'opacity-75' : 'text-gray-500'
                }`}>
                  {message.timestamp}
                  {message.isBot && ' ✓✓'}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex mb-4">
              <div className="bg-white rounded-lg shadow-sm px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <Input
              type="text"
              placeholder="Escribe un mensaje de prueba..."
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 rounded-full"
              disabled={testMessageMutation.isPending}
              data-testid="input-test-message"
            />
            <Button 
              type="submit"
              className="bg-whatsapp-500 text-white hover:bg-whatsapp-600 rounded-full p-2"
              disabled={!testMessage.trim() || testMessageMutation.isPending}
              data-testid="button-send-test-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
