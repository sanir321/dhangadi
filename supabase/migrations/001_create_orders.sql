-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        TEXT UNIQUE NOT NULL,
  game            TEXT NOT NULL,
  game_name       TEXT NOT NULL,
  package_id      TEXT NOT NULL,
  package_label   TEXT NOT NULL,
  price           INTEGER NOT NULL,
  cost            INTEGER NOT NULL,
  profit          INTEGER GENERATED ALWAYS AS (price - cost) STORED,
  player_id       TEXT NOT NULL,
  server_id       TEXT,
  remark          TEXT,
  screenshot_url  TEXT NOT NULL,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','completed','failed')),
  telegram_sent   BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_game ON orders (game);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert orders (for checkout)
CREATE POLICY "Enable insert for anonymous users" ON orders
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users (admin) to read and update all orders
CREATE POLICY "Enable all for authenticated users" ON orders
  FOR ALL TO authenticated USING (true);

-- Storage bucket for screenshots
-- Note: This is usually done via Supabase Dashboard or API, but for documentation:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- Storage RLS (Manual setup usually required in Supabase Dashboard)
-- Policy: Allow anon to upload (write) to 'screenshots' bucket
-- Policy: Allow all to read (select) from 'screenshots' bucket
