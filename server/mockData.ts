import { randomUUID } from "crypto";

type Conversation = {
  id: string | null;
  phone: string;
  name?: string;
  bot_enabled?: boolean;
  assigned_to?: string | null;
  assigned_at?: string | null;
  tags?: string[];
  status?: string;
  created_at?: string;
};

type Contact = {
  id: string | null;
  phone: string;
  name?: string;
  notes?: string;
  tags?: string[];
  created_at?: string;
};

type Message = {
  id: string;
  phone?: string;
  message?: string;
  name?: string;
  source?: string;
  created_at?: string;
};

type Note = {
  id: string | null;
  conversation_id: string | null;
  author?: string;
  text: string;
  created_at?: string;
};

// In-memory stores
const conversations: Conversation[] = [
  {
    id: randomUUID(),
    phone: "5527995270701",
    name: "Luiz Fernando",
    bot_enabled: false,
    assigned_to: null,
    assigned_at: null,
    tags: [],
    status: "open",
    created_at: new Date().toISOString(),
  },
];

const contacts: Contact[] = [
  { id: randomUUID(), phone: "5527995270701", name: "Luiz Fernando", notes: "Cliente VIP", tags: [], created_at: new Date().toISOString() },
];

const messages: Message[] = [
  { id: randomUUID(), phone: "5527995270701", message: "Olá, como posso ajudar?", name: "Agente", source: "mock", created_at: new Date().toISOString() },
];

const notes: Note[] = [];

export function getConversationsMock() {
  // return copy
  return conversations.map((c) => ({ ...c }));
}

export function getOrCreateConversationByPhoneMock(phone: string) {
  let conv = conversations.find((c) => c.phone === phone);
  if (!conv) {
    conv = {
      id: randomUUID(),
      phone,
      name: undefined,
      bot_enabled: false,
      assigned_to: null,
      assigned_at: null,
      tags: [],
      status: "open",
      created_at: new Date().toISOString(),
    };
    conversations.push(conv);
  }
  return { ...conv };
}

export function upsertContactMock({ phone, name, notes: n, tags }: { phone: string; name: string; notes?: string; tags?: string[] }) {
  let c = contacts.find((x) => x.phone === phone);
  if (c) {
    c.name = name;
    c.notes = n ?? c.notes;
    c.tags = tags ?? c.tags;
  } else {
    c = { id: randomUUID(), phone, name, notes: n ?? "", tags: tags ?? [], created_at: new Date().toISOString() };
    contacts.push(c);
  }
  return { ...c };
}

export function updateContactByIdMock(id: string, updates: Partial<Contact>) {
  const c = contacts.find((x) => x.id === id);
  if (!c) return null;
  Object.assign(c, updates);
  return { ...c };
}

export function insertMessageMock(payload: any) {
  const m: Message = { id: randomUUID(), phone: payload.phone, message: payload.message, name: payload.name ?? payload.name, source: payload.source ?? "mock", created_at: payload.created_at ?? new Date().toISOString() };
  messages.push(m);
  return { ...m };
}

export function addNoteMock({ conversation_id, author, text }: { conversation_id: string | null; author?: string; text: string }) {
  const n: Note = { id: randomUUID(), conversation_id, author, text, created_at: new Date().toISOString() };
  notes.push(n);
  return { ...n };
}

export function getNotesMock(conversation_id: string | null) {
  return notes.filter((n) => n.conversation_id === conversation_id).map((n) => ({ ...n }));
}

export function updateConversationMock(id: string | null, updates: Partial<Conversation>) {
  const conv = conversations.find((c) => c.id === id || (id === null && c.phone === updates.phone));
  if (!conv) return null;
  Object.assign(conv, updates);
  return { ...conv };
}

export function getContactByPhoneMock(phone: string) {
  return contacts.find((c) => c.phone === phone) ? { ...contacts.find((c) => c.phone === phone) } : null;
}

export default {
  getConversationsMock,
  getOrCreateConversationByPhoneMock,
  upsertContactMock,
  updateContactByIdMock,
  insertMessageMock,
  addNoteMock,
  getNotesMock,
  updateConversationMock,
  getContactByPhoneMock,
};
