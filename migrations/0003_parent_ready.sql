ALTER TABLE children ADD COLUMN guardian_consent_at TEXT;
ALTER TABLE children ADD COLUMN privacy_version TEXT;

ALTER TABLE books ADD COLUMN share_enabled INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS request_limits (
  scope TEXT NOT NULL,
  identity_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scope, identity_hash, window_start)
);

-- Existing family books were created before privacy controls existed. Hide all
-- of them, then preserve only the intentionally curated landing-page demo.
UPDATE books SET public_gallery = 0, share_enabled = 0;
UPDATE books
SET public_gallery = 1, share_enabled = 1
WHERE id = 'defc199b-aa44-4006-a836-dd416615a1b4';
