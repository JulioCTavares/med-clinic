CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "status" "appointment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "health_plans" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "health_plans" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "health_plans" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "specialties" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "specialties" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "specialties" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "procedures" ADD COLUMN "deleted_at" timestamp;