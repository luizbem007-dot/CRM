-- Migration: create conversations, contacts, conversation_notes, alter messages

-- conversations table (if not already present)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text,
  client_id text,
  name text,
  bot_enabled boolean DEFAULT true,
  assigned_to text,
  assigned_at timestamptz,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text,
  notes text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- conversation_notes table
CREATE TABLE IF NOT EXISTS conversation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  author text,
  text text,
  created_at timestamptz DEFAULT now()
);

-- messages table: add delivery_status column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='delivery_status') THEN
    ALTER TABLE IF EXISTS messages ADD COLUMN delivery_status text;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not ensure messages.delivery_status: %', SQLERRM;
END$$;

-- conversations table adjustments if table name 'fiqon' used previously: create view or migrate data
-- If existing table fiqon exists, create a migration step to copy minimal data (optional)

-- NOTE: Run this SQL in Supabase SQL editor or via psql connected to your database.
