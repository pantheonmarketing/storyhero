CREATE TABLE IF NOT EXISTS provider_connections (
  provider TEXT PRIMARY KEY,
  client_id TEXT,
  client_secret_enc TEXT,
  access_token_enc TEXT,
  refresh_token_enc TEXT,
  expires_at INTEGER,
  oauth_state TEXT,
  code_verifier_enc TEXT,
  account_email TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS provider_usage (
  provider TEXT NOT NULL,
  day TEXT NOT NULL,
  credits_reserved INTEGER NOT NULL DEFAULT 0,
  jobs INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (provider, day)
);
