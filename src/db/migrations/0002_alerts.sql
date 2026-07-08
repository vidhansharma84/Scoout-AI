-- Detections (raw worker events), alerts (rule-matched detections we surface
-- to the customer), and camera_health (worker-reported stream state).

CREATE TABLE IF NOT EXISTS detections (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id      uuid NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
  worker_id      text NOT NULL,
  at             timestamptz NOT NULL,
  class          text NOT NULL,
  confidence     numeric NOT NULL,
  bbox_json      jsonb,
  frame_hash     text,                       -- dedupe key from the worker
  thumbnail_key  text,                       -- B2 object key (Week 5)
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS detections_camera_at_idx ON detections (camera_id, at DESC);

CREATE TABLE IF NOT EXISTS alerts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id           uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  camera_id         uuid REFERENCES cameras(id) ON DELETE SET NULL,
  rule_id           uuid REFERENCES rules(id) ON DELETE SET NULL,
  detection_id      uuid REFERENCES detections(id) ON DELETE SET NULL,
  type              text NOT NULL,          -- 'Fire detected', 'Motion after-hours'…
  severity          text NOT NULL,          -- critical | warn | info
  summary           text NOT NULL,
  clip_key          text,
  thumbnail_key     text,
  reasoning         text,                   -- what the LLM said matched (Week 7 will be real)
  status            text NOT NULL DEFAULT 'open',  -- open | reviewed | dismissed
  reviewed_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at       timestamptz,
  dismissed_reason  text,
  at                timestamptz NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS alerts_shop_status_at_idx ON alerts (shop_id, status, at DESC);
CREATE INDEX IF NOT EXISTS alerts_camera_at_idx ON alerts (camera_id, at DESC);

CREATE TABLE IF NOT EXISTS camera_health (
  camera_id      uuid PRIMARY KEY REFERENCES cameras(id) ON DELETE CASCADE,
  last_frame_at  timestamptz,
  fps_actual     numeric,
  latency_ms     integer,
  stream_state   text,
  updated_at     timestamptz NOT NULL DEFAULT now()
);
