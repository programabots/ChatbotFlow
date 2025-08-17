import path from "path";
import { type Express } from "express";

export function log(message: string) {
  console.log(message);
}

export async function setupVite(app: Express, server: any) {
  // Solo usarías Vite en dev, pero si no lo necesitas,
  // podés deshabilitarlo directamente para Render.
  log("⚡ Vite setup skipped (no HMR en producción)");
}

export function serveStatic(app: Express) {
  const distPath = path.resolve("dist");
  app.use("/", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
