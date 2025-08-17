// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging sencillo para rutas /api
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  (res as any).json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {}
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Registra todas las rutas de API
  const server = await registerRoutes(app);

  // 🔹 Arreglo rápido: responder algo útil en "/"
  app.get("/", (_req: Request, res: Response) => {
    res.type("html").send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>ChatbotFlow</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 40px; line-height: 1.5; }
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
      code { padding: 2px 6px; background:#f3f4f6; border-radius:6px; }
    </style>
  </head>
  <body>
    <h1>ChatbotFlow</h1>
    <p>Backend en línea ✅</p>
    <p>Endpoints de prueba:</p>
    <ul>
      <li><a href="/api/settings">GET /api/settings</a></li>
      <li><a href="/api/conversations">GET /api/conversations</a></li>
      <li><a href="/api/responses">GET /api/responses</a></li>
    </ul>
    <p>Puerto: <code>${process.env.PORT ?? "5000"}</code></p>
  </body>
</html>`);
  });

  // Manejador de errores
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err?.status || err?.statusCode || 500;
    const message = err?.message || "Internal Server Error";
    res.status(status).json({ message });
    // Re-lanzamos para que quede en logs de Render
    throw err;
  });

  // En desarrollo usa Vite middleware; en prod sirve estáticos (si hay)
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Servir en el puerto de Render (o 5000 local)
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => { log(`serving on port ${port}`); }
  );
})();
