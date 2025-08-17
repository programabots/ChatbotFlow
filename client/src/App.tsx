import { useEffect, useMemo, useState } from "react";
import API from "./api";

type Conversation = {
  id: string;
  customerPhone: string;
  customerName?: string | null;
  status: "active" | "closed" | "transferred";
  lastMessage?: string | null;
  lastMessageAt: string | Date;
  unreadCount: number;
  createdAt: string | Date;
};

type Message = {
  id: string;
  conversationId: string;
  messageText: string;
  messageType: "incoming" | "outgoing" | "bot";
  isFromBot: boolean;
  timestamp: string | Date;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // cargar settings
  useEffect(() => {
    (async () => {
      try {
        const s = await API.getSettings();
        setSettings(s);
      } catch (e: any) {
        setError(e?.message);
      }
    })();
  }, []);

  // cargar conversaciones
  useEffect(() => {
    let stop = false;
    const load = async () => {
      try {
        const list = await API.listConversations();
        if (!stop) setConversations(list);
        if (!stop && list.length && !activeId) {
          setActiveId(list[0].id);
        }
      } catch (e: any) {
        setError(e?.message);
      } finally {
        if (!stop) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 10000);
    return () => { stop = true; clearInterval(t); };
  }, [activeId]);

  // cargar mensajes de conversación activa
  useEffect(() => {
    if (!activeId) return;
    let stop = false;
    const loadMsgs = async () => {
      try {
        const list = await API.listMessages(activeId);
        if (!stop) setMessages(list);
      } catch (e: any) {
        setError(e?.message);
      }
    };
    loadMsgs();
    const t = setInterval(loadMsgs, 5000);
    return () => { stop = true; clearInterval(t); };
  }, [activeId]);

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  const handleSend = async () => {
    if (!newMessage.trim() || !activeId) return;
    try {
      await API.sendMessage(activeId, newMessage.trim());
      setNewMessage("");
      const list = await API.listMessages(activeId);
      setMessages(list);
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const handleClose = async () => {
    if (!activeId) return;
    try {
      await API.closeConversation(activeId);
      const list = await API.listMessages(activeId);
      setMessages(list);
      const convos = await API.listConversations();
      setConversations(convos);
    } catch (e: any) {
      setError(e?.message);
    }
  };

  const handleUpdateSettings = async (field: string, value: string) => {
    try {
      const updated = { ...settings, [field]: value };
      await API.updateSettings(updated);
      setSettings(updated);
    } catch (e: any) {
      setError(e?.message);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-full sm:w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">📥 Inbox WhatsApp</h1>
          {settings && (
            <div className="text-xs text-gray-600 space-y-1 mt-2">
              <div>
                <label className="block text-gray-500">Mensaje de apertura</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={settings.openingMessage || ""}
                  onChange={(e) => handleUpdateSettings("openingMessage", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-500">Mensaje de cierre</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={settings.closingMessage || ""}
                  onChange={(e) => handleUpdateSettings("closingMessage", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="p-4 text-sm text-gray-500">Cargando conversaciones…</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No hay conversaciones todavía.</div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <li
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`px-4 py-3 cursor-pointer border-b hover:bg-gray-50 ${
                  c.id === activeId ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {c.customerName || c.customerPhone}
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                {c.lastMessage && (
                  <div className="text-xs text-gray-600 truncate">{c.lastMessage}</div>
                )}
                <div className="text-[10px] text-gray-400">
                  {new Date(c.lastMessageAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Panel de mensajes */}
      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {activeConversation
                ? activeConversation.customerName || activeConversation.customerPhone
                : "Sin selección"}
            </div>
            {activeConversation && (
              <div className="text-xs text-gray-500">
                Estado: {activeConversation.status}
              </div>
            )}
          </div>
          {activeConversation && activeConversation.status === "active" && (
            <button
              onClick={handleClose}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded"
            >
              Cerrar conversación
            </button>
          )}
        </div>

        {activeConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] px-3 py-2 rounded ${
                    m.messageType === "incoming"
                      ? "bg-white border self-start"
                      : m.isFromBot
                      ? "bg-amber-50 border self-end"
                      : "bg-blue-600 text-white self-end"
                  }`}
                  style={{
                    alignSelf:
                      m.messageType === "incoming" ? "flex-start" : "flex-end",
                  }}
                >
                  <div className="text-sm">{m.messageText}</div>
                  <div className="text-[10px] opacity-60 mt-1">
                    {new Date(m.timestamp).toLocaleString()}
                    {m.isFromBot ? " · bot" : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Caja de envío */}
            {activeConversation.status === "active" && (
              <div className="p-3 border-t flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2 text-sm"
                  placeholder="Escribir mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Enviar
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 grid place-items-center text-gray-500">
            Seleccioná una conversación
          </div>
        )}
      </main>
    </div>
  );
}
