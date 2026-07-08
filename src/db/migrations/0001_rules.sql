-- Watchlist rules (natural-language prompts) applied to specific cameras.

CREATE TABLE IF NOT EXISTS rules (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  prompt       text NOT NULL,
  active       boolean NOT NULL DEFAULT true,
  cameras      uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  created_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rules_shop_id_idx ON rules (shop_id);
