-- Add per-post default working hours
ALTER TABLE "washing_posts"
ADD COLUMN IF NOT EXISTS "workFromMinutes" INTEGER NOT NULL DEFAULT 600,
ADD COLUMN IF NOT EXISTS "workToMinutes"   INTEGER NOT NULL DEFAULT 1200;
