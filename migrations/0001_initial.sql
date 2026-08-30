CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  hero_url TEXT,
  hero_style TEXT,
  hero_regens INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  child_id TEXT NOT NULL,
  story_id TEXT NOT NULL,
  title_th TEXT,
  title_en TEXT,
  status TEXT NOT NULL DEFAULT 'writing',
  pages_total INTEGER NOT NULL DEFAULT 0,
  pages_done INTEGER NOT NULL DEFAULT 0,
  cover_url TEXT,
  error TEXT,
  dedication TEXT,
  friend_name TEXT,
  public_gallery INTEGER DEFAULT 1,
  ready_email_sent INTEGER DEFAULT 0,
  art_style TEXT DEFAULT 'watercolor',
  mode TEXT DEFAULT 'classic',
  custom_costume TEXT,
  custom_brief TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pages (
  book_id TEXT NOT NULL,
  idx INTEGER NOT NULL,
  text_th TEXT,
  text_en TEXT,
  image_prompt TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  audio_url_th TEXT,
  audio_url_en TEXT,
  PRIMARY KEY (book_id, idx)
);

CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 1,
  last_sent_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS print_orders (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  book_id TEXT NOT NULL,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS package_interest (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  package TEXT NOT NULL,
  contact TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_credits (
  email TEXT PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 0,
  banned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT,
  admin_email TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
