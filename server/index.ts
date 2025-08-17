import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log simple de APIs
app.use((req, res, next) => {
  const start = Date.now();
  const pathUrl = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  (res as any).json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathUrl.startsWith("/api")) {
      let logLine = `${req.method} ${pathUrl} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // ignore
        }
      }
      if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
      console.log(logLine);
    }
  });

  next();
});

// Registrar rutas API
await registerRoutes(app);

// ---- Servir el FRONTEND compilado por Vite ----
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(__dirname, "../public");

// Archivos estáticos (JS/CSS/IMG del build de Vite)
app.use(express.static(staticDir));

// Página de estado de la API (opcional)
app.get("/api", (_req: Request, res: Response) => {
  res.type("text/html").send(`
    <h1>ChatbotFlow API</h1>
    <p>Servicio levantado ✅</p>
    <p>Probá: <code>/api/settings</code>, <code>/api/conversations</code>, <code>/api/responses</code></p>
  `);
});

// Catch-all para la SPA de React (debe ir al final)
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

// Manejo básico de errores
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`serving on port ${port}`);
});
