-- Team invitations: shop owners invite reviewers by email.
-- The token is emailed as a link. When the invitee opens it, they choose a
-- password and become a user in the shop.

CREATE TABLE IF NOT EXISTS team_invites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email        text NOT NULL,
  role         text NOT NULL DEFAULT 'reviewer',
  token        text UNIQUE NOT NULL,
  invited_by   uuid REFERENCES users(id) ON DELETE SET NULL,
  expires_at   timestamptz NOT NULL,
  accepted_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_invites_shop_idx ON team_invites (shop_id);
CREATE INDEX IF NOT EXISTS team_invites_email_idx ON team_invites (lower(email));
