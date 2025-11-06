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

  // Conversation management routes
  import("./routes/conversations").then((m) => {
    app.get('/api/conversations', m.handleGetConversations);
    app.post('/api/conversations/:id/bot', m.handleToggleBot);
    app.post('/api/conversations/:id/assign', m.handleAssign);
    app.post('/api/conversations/:id/release', m.handleRelease);
    app.post('/api/conversations/:id/status', m.handleSetStatus);
    app.post('/api/conversations/:id/tags', m.handleUpdateTags);
  }).catch((e) => console.warn('Could not load conversations routes', e));

  // Contacts and notes
  import("./routes/contacts_notes").then((m) => {
    app.post('/api/contacts', m.handleCreateContact);
    app.put('/api/contacts/:id', m.handleEditContact);
    app.post('/api/notes', m.handleAddNote);
    app.get('/api/notes', m.handleGetNotes);
  }).catch((e) => console.warn('Could not load contacts/notes routes', e));

  return app;
}
