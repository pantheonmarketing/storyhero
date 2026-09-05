ALTER TABLE user_credits ADD COLUMN approved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_credits ADD COLUMN approved_at TEXT;
ALTER TABLE user_credits ADD COLUMN approved_by TEXT;

-- Existing parent accounts also require an explicit review. Credits are restored
-- to the unused portion of the six-book allowance when the owner approves them.
UPDATE user_credits
SET approved = CASE WHEN lower(email) = 'yoniwe@gmail.com' THEN 1 ELSE 0 END,
    credits = CASE WHEN lower(email) = 'yoniwe@gmail.com' THEN credits ELSE 0 END,
    approved_at = CASE WHEN lower(email) = 'yoniwe@gmail.com' THEN datetime('now') ELSE NULL END,
    approved_by = CASE WHEN lower(email) = 'yoniwe@gmail.com' THEN 'system' ELSE NULL END;
