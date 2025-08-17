const API = {
  async getSettings() {
    const r = await fetch("/api/settings");
    if (!r.ok) throw new Error("No se pudo cargar settings");
    return r.json();
  },
  async updateSettings(data: any) {
    const r = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error("No se pudo actualizar settings");
    return r.json();
  },
  async listConversations() {
    const r = await fetch("/api/conversations");
    if (!r.ok) throw new Error("No se pudo cargar conversaciones");
    return r.json();
  },
  async listMessages(conversationId: string) {
    const r = await fetch(`/api/conversations/${conversationId}/messages`);
    if (!r.ok) throw new Error("No se pudo cargar mensajes");
    return r.json();
  },
  async sendMessage(conversationId: string, text: string) {
    const r = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageText: text }),
    });
    if (!r.ok) throw new Error("No se pudo enviar mensaje");
    return r.json();
  },
  async closeConversation(conversationId: string) {
    const r = await fetch(`/api/conversations/${conversationId}/close`, {
      method: "PATCH",
    });
    if (!r.ok) throw new Error("No se pudo cerrar la conversación");
    return r.json();
  },
};

export default API;
