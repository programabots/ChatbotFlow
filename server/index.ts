// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes.js";

function log(message: string, source = "express") {
  const t = new Date().toLocaleTimeString("en-US", { hour12: false });
  console.log(`${t} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log básico de /api
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let captured: unknown;

  const origJson = res.json.bind(res);
  (res as any).json = (body: unknown, ...args: unknown[]) => {
    captured = body;
    return origJson(body, ...args);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const ms = Date.now() - start;
      let line = `${req.method} ${path} ${res.statusCode} in ${ms}ms`;
      try {
        if (captured) line += ` :: ${JSON.stringify(captured)}`;
      } catch {}
      if (line.length > 200) line = line.slice(0, 199) + "…";
      log(line);
    }
  });

  next();
});

// Registra rutas de API
await registerRoutes(app);

// Página mínima en raíz para no ver "Cannot GET /"
app.get("/", (_req: Request, res: Response) => {
  res.type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ChatbotFlow</title>
<style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:40px;line-height:1.5}
a{color:#2563eb;text-decoration:none}a:hover{text-decoration:underline}code{background:#f3f4f6;border-radius:6px;padding:2px 6px}</style>
</head><body>
<h1>ChatbotFlow</h1>
<p>Backend en línea ✅</p>
<ul>
<li><a href="/api/settings">GET /api/settings</a></li>
<li><a href="/api/conversations">GET /api/conversations</a></li>
<li><a href="/api/responses">GET /api/responses</a></li>
</ul>
<p>PORT: <code>${process.env.PORT ?? "5000"}</code></p>
</body></html>`);
});

// Manejador de errores JSON
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ message });
  throw err; // para que Render lo loguee
});

// Crea http.Server y escucha
const httpServer = createServer(app);

// En desarrollo, si querés Vite, se importa dinámicamente (no rompe el build si no existe)
if (app.get("env") === "development") {
  try {
    const viteMod = await import("./vite.js");
    if (viteMod?.setupVite) {
      await viteMod.setupVite(app, httpServer);
    }
  } catch {
    // no pasa nada si no está
  }
}

const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen({ port, host: "0.0.0.0" }, () => log(`serving on port ${port}`));
