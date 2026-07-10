CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "exams" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "pdf_url" text NOT NULL,
  "duration_minutes" integer DEFAULT 90 NOT NULL,
  "answer_key" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "exam_id" uuid NOT NULL,
  "student_name" text NOT NULL,
  "score" real NOT NULL,
  "answers" jsonb NOT NULL,
  "submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
