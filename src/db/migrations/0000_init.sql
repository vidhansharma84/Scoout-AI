-- Scoout AI portal — initial schema.
-- Applied by scripts/migrate.mjs on each deploy.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS shops (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  city           text,
  country        text DEFAULT 'GH',
  plan           text NOT NULL DEFAULT 'trial',
  trial_ends_at  timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id        uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email          text NOT NULL,
  password_hash  text NOT NULL,
  role           text NOT NULL DEFAULT 'reviewer',
  name           text,
  initials       text,
  phone          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (lower(email));

CREATE TABLE IF NOT EXISTS sessions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash    text NOT NULL,
  user_agent            text,
  ip                    inet,
  expires_at            timestamptz NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id);

CREATE TABLE IF NOT EXISTS cameras (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id             uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name                text NOT NULL,
  location            text,
  protocol            text NOT NULL DEFAULT 'rtsp',
  stream_url          text NOT NULL,
  hue                 integer DEFAULT 30,
  resolution          text,
  fps_target          integer DEFAULT 15,
  inference_profile   text DEFAULT 'balanced',
  status              text NOT NULL DEFAULT 'connecting',
  worker_id           text,
  archived            boolean NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS cameras_shop_id_idx ON cameras (shop_id);
