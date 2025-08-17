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
 * Sólo se usa en desarrollo. Inyecta el middleware de Vite para HMR
 * y sirve el index.html transformado.
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
        // fallá fuerte en dev si Vite se queja
        process.exit(1);
      },
    },
  });

  // Middlewares de Vite (sirven /@vite, HMR, etc.)
  app.use(vite.middlewares);

  // Fallback a index.html (transformado por Vite)
  app.use("*", async (req, res, next) => {
    try {
      const url = req.originalUrl;

      // En dev leemos SIEMPRE desde /client/index.html del repo
      const clientTemplate = path.resolve(process.cwd(), "client", "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      // cache-busting del entry principal (evita cache agresivo del navegador)
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
 * Producción: sirve los estáticos ya “buildeados” por Vite
 * desde <root>/dist/public
 */
export function serveStatic(app: Express) {
  // En runtime (prod), __dirname === <root>/dist/server
  // El cliente queda en <root>/dist/public → subir a .. y entrar a "public"
  const distPath = path.resolve(__dirname, "..", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `No existe el build del cliente en: ${distPath}. Corré "vite build".`
    );
  }

  // Sirve assets estáticos
  app.use(express.static(distPath));

  // Fallback SPA → index.html de producción
  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
