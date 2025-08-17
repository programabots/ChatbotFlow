import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "3009_elmejorprogramadorchild";

// ✅ GET para validación inicial
app.get("/webhook", (req, res) => {
const mode = req.query["hub.mode"];
const token = req.query["hub.verify_token"];
const challenge = req.query["hub.challenge"];

if (mode && token) {
if (mode === "subscribe" && token === VERIFY_TOKEN) {
console.log("✅ Webhook verificado correctamente");
return res.status(200).send(challenge);
} else {
return res.sendStatus(403); // Token inválido
}
}
return res.sendStatus(400);
});

// ✅ POST para recibir mensajes de WhatsApp
app.post("/webhook", (req, res) => {
const body = req.body;
console.log("📩 Mensaje recibido:", JSON.stringify(body, null, 2));

res.sendStatus(200); // WhatsApp necesita 200 OK
});

// Health check
app.get("/healthz", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

