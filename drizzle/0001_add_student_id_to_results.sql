ALTER TABLE "results"
ADD COLUMN IF NOT EXISTS "student_id" text;

UPDATE "results"
SET "student_id" = ''
WHERE "student_id" IS NULL;

ALTER TABLE "results"
ALTER COLUMN "student_id" SET NOT NULL;

ALTER TABLE "results"
ALTER COLUMN "student_id" DROP DEFAULT;
