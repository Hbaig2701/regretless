-- Add chronological age to user_state for cognitive-age scoring.
ALTER TABLE user_state ADD COLUMN IF NOT EXISTS age INTEGER;
UPDATE user_state SET age = 27 WHERE id = 1 AND age IS NULL;
