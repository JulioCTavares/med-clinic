CREATE TYPE "public"."user_role" AS ENUM('admin', 'doctor', 'patient');--> statement-breakpoint
CREATE TABLE "appointment_procedures" (
	"appointment_id" uuid NOT NULL,
	"procedure_id" uuid NOT NULL,
	CONSTRAINT "appointment_procedures_appointment_id_procedure_id_pk" PRIMARY KEY("appointment_id","procedure_id")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL,
	"is_private" boolean DEFAULT false NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	CONSTRAINT "appointments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"crm" varchar(30) NOT NULL,
	"specialty_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "doctors_crm_unique" UNIQUE("crm")
);
--> statement-breakpoint
CREATE TABLE "health_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(200) NOT NULL,
	"phone" varchar(30),
	CONSTRAINT "health_plans_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"birth_date" date,
	"phones" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "specialties_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "patient_health_plans" (
	"patient_id" uuid NOT NULL,
	"health_plan_id" uuid NOT NULL,
	"contract_number" varchar(100) NOT NULL,
	CONSTRAINT "patient_health_plans_patient_id_health_plan_id_pk" PRIMARY KEY("patient_id","health_plan_id")
);
--> statement-breakpoint
CREATE TABLE "procedures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(150) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	CONSTRAINT "procedures_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "appointment_procedures" ADD CONSTRAINT "appointment_procedures_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment_procedures" ADD CONSTRAINT "appointment_procedures_procedure_id_procedures_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_health_plans" ADD CONSTRAINT "patient_health_plans_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_health_plans" ADD CONSTRAINT "patient_health_plans_health_plan_id_health_plans_id_fk" FOREIGN KEY ("health_plan_id") REFERENCES "public"."health_plans"("id") ON DELETE cascade ON UPDATE no action;