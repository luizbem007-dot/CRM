import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin } from "./routes/auth";
import { handleZapiWebhook } from "./routes/zapi";
import { handleCreateMessage } from "./routes/messages";
import { handleTestZapi } from "./routes/test_zapi";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/auth/login", handleLogin);

  // Z-API webhook endpoint for incoming messages
  app.post("/api/zapi/webhook", handleZapiWebhook);
  // server-side message insertion endpoint to avoid client-side supabase insert issues
  app.post("/api/messages", handleCreateMessage);
  app.get("/api/test-zapi", handleTestZapi);

  return app;
}
