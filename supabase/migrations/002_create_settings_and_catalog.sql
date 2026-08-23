-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read of site_settings
DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT TO public USING (true);

-- Allow full access for managing site_settings
DROP POLICY IF EXISTS "Allow all for site_settings" ON site_settings;
CREATE POLICY "Allow all for site_settings" ON site_settings
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Create game_catalog table
CREATE TABLE IF NOT EXISTS game_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  currency TEXT NOT NULL,
  currency_icon TEXT,
  id_field TEXT NOT NULL DEFAULT 'Player ID',
  server_required BOOLEAN DEFAULT FALSE,
  icon TEXT,
  banner TEXT,
  description TEXT,
  theme_color TEXT DEFAULT '#4cc9f0',
  supports_quantity BOOLEAN DEFAULT FALSE,
  pricing JSONB,
  packages JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on game_catalog
ALTER TABLE game_catalog ENABLE ROW LEVEL SECURITY;

-- Allow public read of game_catalog
DROP POLICY IF EXISTS "Public read game_catalog" ON game_catalog;
CREATE POLICY "Public read game_catalog" ON game_catalog
  FOR SELECT TO public USING (true);

-- Allow full access for managing game_catalog
DROP POLICY IF EXISTS "Allow all for game_catalog" ON game_catalog;
CREATE POLICY "Allow all for game_catalog" ON game_catalog
  FOR ALL TO public USING (true) WITH CHECK (true);
