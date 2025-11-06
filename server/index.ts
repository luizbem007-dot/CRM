import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleLogin } from "./routes/auth";
import { handleZapiWebhook } from "./routes/zapi";
import { handleCreateMessage } from "./routes/messages";
import { handleTestZapi } from "./routes/test_zapi";
import { handleGetConversations, handleToggleBot, handleAssign, handleRelease, handleSetStatus, handleUpdateTags, handleGetOrCreateByPhone } from "./routes/conversations";
import { handleCreateContact, handleEditContact, handleAddNote, handleGetNotes } from "./routes/contacts_notes";

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
  app.get('/api/conversations', handleGetConversations);
  app.get('/api/conversations/by-phone/:phone', handleGetOrCreateByPhone);
  app.post('/api/conversations/:id/bot', handleToggleBot);
  app.post('/api/conversations/:id/assign', handleAssign);
  app.post('/api/conversations/:id/release', handleRelease);
  app.post('/api/conversations/:id/status', handleSetStatus);
  app.post('/api/conversations/:id/tags', handleUpdateTags);

  // Contacts and notes
  app.post('/api/contacts', handleCreateContact);
  app.put('/api/contacts/:id', handleEditContact);
  app.post('/api/notes', handleAddNote);
  app.get('/api/notes', handleGetNotes);

  return app;
}
