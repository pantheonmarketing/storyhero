UPDATE user_credits
SET approved = 1,
    approved_at = COALESCE(approved_at, datetime('now')),
    approved_by = 'system'
WHERE lower(email) IN ('krubow.cu@gmail.com', 'pitiphat.siri@gmail.com');
