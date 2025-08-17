// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Página simple para la raíz (evita "Cannot GET /")
app.get("/", (_req, res) => {
  res.send(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><title>ChatbotFlow</title></head>
<body style="font-family:system-ui;padding:24px">
  <h1>ChatbotFlow API</h1>
  <p>Servicio levantado ✅</p>
  <p>Probá: <code>/api/settings</code>, <code>/api/conversations</code>, <code>/api/responses</code></p>
</body></html>`);
});

// Logging básico para rutas /api
app.use((req, res, next) => {
  const start = Date.now();
  let captured: unknown;
  const originalJson = res.json.bind(res);
  (res as any).json = (body: unknown, ...args: any[]) => {
    captured = body;
    return originalJson(body, ...args);
  };
  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${req.path} ${res.statusCode} in ${ms}ms`;
      if (captured) {
        const s = JSON.stringify(captured);
        line += ` :: ${s.length > 300 ? s.slice(0, 299) + "…" : s}`;
      }
      console.log(line);
    }
  });
  next();
});

(async () => {
  // registerRoutes devuelve el app (Express). No necesitamos pasarlo a ningún server aquí.
  await registerRoutes(app);

  // Manejo de errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status ?? err?.statusCode ?? 500;
    const message = err?.message ?? "Internal Server Error";
    res.status(status).json({ message });
  });

  // Creamos el http.Server nosotros (para Render)
  const server = createServer(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0" }, () => {
    console.log(`serving on port ${port}`);
  });
})();
