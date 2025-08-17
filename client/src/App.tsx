// client/src/App.tsx
import { useState } from "react";

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, `🧑: ${input}`]);
    setMessages((prev) => [...prev, `🤖: Respuesta a "${input}"`]);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">💬 ChatbotFlow</h1>

      <div className="w-full max-w-md bg-white shadow-md rounded p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-2 space-y-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded ${
                m.startsWith("🧑") ? "bg-blue-100 text-left" : "bg-green-100 text-right"
              }`}
            >
              {m}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
