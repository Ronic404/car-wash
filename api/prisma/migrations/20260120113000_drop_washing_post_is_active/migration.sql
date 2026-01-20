-- Drop isActive from washing_posts (post activation is controlled by day schedules)
ALTER TABLE "washing_posts" DROP COLUMN IF EXISTS "isActive";
