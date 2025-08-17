import express, { type Request, type Response, type NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message: string) {
  const ts = new Date().toISOString();
  console.log(`${ts} [server] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// logging de /api
app.use((req, res, next) => {
  const start = Date.now();
  const pathReq = req.path;
  let captured: unknown;

  const origJson = res.json.bind(res);
  res.json = (body: unknown) => {
    captured = body;
    return origJson(body);
  };

  res.on("finish", () => {
    const ms = Date.now() - start;
    if (pathReq.startsWith("/api")) {
      let line = `${req.method} ${pathReq} ${res.statusCode} in ${ms}ms`;
      if (captured) line += ` :: ${JSON.stringify(captured)}`;
      if (line.length > 160) line = line.slice(0, 159) + "…";
      log(line);
    }
  });

  next();
});

// API mínima (placeholder)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// servir estáticos del cliente compilado
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));

// fallback SPA
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err?.status || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`ERROR ${status}: ${message}`);
});

const port = parseInt(process.env.PORT || "5000", 10);
app.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});
