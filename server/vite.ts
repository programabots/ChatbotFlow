import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { createServer as createViteServer, createLogger } from "vite";
import type { Server } from "node:http";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  // eslint-disable-next-line no-console
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    configFile: false,
    appType: "custom",
    customLogger: viteLogger,
    server: {
      middlewareMode: true,
      hmr: { server },
      allowedHosts: true as const
    },
    root: path.resolve(import.meta.dirname, "..", "client")
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "..", "public");
  // en build, Vite pone la SPA en dist/public (copiado a server/public por tsc)
  const tryPath = path.resolve(import.meta.dirname, "..", "..", "public");
  const finalPath = fs.existsSync(distPath) ? distPath : tryPath;

  if (!fs.existsSync(finalPath)) {
    throw new Error(
      `No se encontró el build del cliente: ${finalPath}. Asegurate de ejecutar "vite build".`
    );
  }

  app.use(express.static(finalPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(finalPath, "index.html"));
  });
}
