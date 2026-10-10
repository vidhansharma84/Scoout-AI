-- SMS notifications (mNotify): password reset codes, invites by phone, and
-- bookkeeping so background jobs text people once rather than every tick.

-- Teammates without email can be invited by phone.
ALTER TABLE team_invites ALTER COLUMN email DROP NOT NULL;
ALTER TABLE team_invites ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE team_invites ADD CONSTRAINT team_invites_email_or_phone
  CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Set when the "camera went offline" SMS goes out; cleared when it comes back.
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS offline_notified_at timestamptz;

-- Set when the "trial ends soon" SMS goes out.
ALTER TABLE shops ADD COLUMN IF NOT EXISTS trial_reminder_sent_at timestamptz;

-- One-time codes for "forgot password". Only the hash is stored.
CREATE TABLE IF NOT EXISTS password_resets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash   text NOT NULL,
  attempts    integer NOT NULL DEFAULT 0,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets (user_id, created_at);
