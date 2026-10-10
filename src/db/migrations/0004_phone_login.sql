-- Phone-or-email accounts. Most shop owners we onboard don't use email, so a
-- user can now sign up and log in with just a phone number.
-- Phones are stored as bare international digits (233XXXXXXXXX) — see
-- normalizePhone() in src/lib/phone.ts — so login can match exactly.

ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

UPDATE users SET phone = NULL WHERE phone IS NOT NULL AND btrim(phone) = '';
UPDATE users SET phone = regexp_replace(phone, '\D', '', 'g') WHERE phone IS NOT NULL;
UPDATE users SET phone = '233' || substr(phone, 2)
  WHERE phone ~ '^0[0-9]{9}$';

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique ON users (phone) WHERE phone IS NOT NULL;

ALTER TABLE users ADD CONSTRAINT users_email_or_phone
  CHECK (email IS NOT NULL OR phone IS NOT NULL);
