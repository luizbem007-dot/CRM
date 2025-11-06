import bcrypt from "bcryptjs";

import bcrypt from "bcryptjs";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_NAME ?? "Users";

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  // It's okay in dev; requests will fail with a clear error if not configured
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role?: string;
  active: boolean;
  passwordHash?: string;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error("Airtable not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID in env.");
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`;
  // Use filterByFormula to match Email exactly (case-insensitive by LOWER)
  const filter = `AND(LOWER({Email})=LOWER('${escapeAirtableFormula(email)}'))`;

  const res = await fetch(`${url}?filterByFormula=${encodeURIComponent(filter)}&maxRecords=1`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });

  if (!res.ok) {
    const txt = await res.clone().text();
    throw new Error(`Airtable request failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const rec = data.records[0];
  const fields = rec.fields || {};

  const user: StoredUser = {
    id: rec.id,
    email: fields.Email ?? "",
    name: fields.Nome ?? fields.Name ?? "",
    role: fields.Cargo ?? fields.Role ?? "",
    active: Boolean(fields.Ativo) === true || fields.Ativo === "TRUE" || fields.Ativo === 1,
    passwordHash: fields.Senha ?? undefined,
  };

  return user;
}

export async function verifyPassword(plain: string, hash?: string) {
  if (!hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch (e) {
    return false;
  }
}

function escapeAirtableFormula(input: string) {
  // Escape single quotes by doubling them for Airtable formula strings
  return input.replace(/'/g, "''");
}
