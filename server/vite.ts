// server/vite.ts
import express, { type Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "node:http";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  // eslint-disable-next-line no-console
  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Desarrollo: inyecta el middleware de Vite (HMR) y sirve index.html transformado.
 */
export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true as const,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    configFile: false,
    appType: "custom",
    server: serverOptions,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;
      // En dev, siempre desde el index del cliente en el repo
      const clientTemplate = path.resolve(process.cwd(), "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // cache-busting del entry principal
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${Date.now()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).setHeader("Content-Type", "text/html").end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

/**
 * Producción: sirve los estáticos ya construidos por Vite desde <root>/dist/public
 * Usamos process.cwd() para evitar duplicar "dist" por usar __dirname relativo a dist/server.
 */
export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `No existe el build del cliente en: ${distPath}. Corré "vite build".`
    );
  }

  // sirve assets estáticos
  app.use(express.static(distPath));

  // fallback de SPA
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
