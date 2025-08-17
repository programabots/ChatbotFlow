// server/vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true as const,
    hmr: { server },
    allowedHosts: true as const
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });

  app.use(vite.middlewares);

  // SSR/SPA fallback para dev
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

      // siempre lee index.html de disco en dev
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // En producción, este archivo vive en dist/server/vite.js
  // El cliente se genera en dist/public (vite.config.ts)
  const distPath = path.resolve(__dirname, "..", "public");

  console.log("[serveStatic] expecting client at:", distPath);
  console.log("[serveStatic] exists?", fs.existsSync(distPath));

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `No se encontró el build del cliente en ${distPath}.
Asegúrate de que 'npm run build' ejecute 'vite build' y que vite.config.ts tenga outDir = "dist/public".`
    );
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
