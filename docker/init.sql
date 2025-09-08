CREATE TABLE "devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial_number" text NOT NULL,
	"model" text NOT NULL,
	"brand" text NOT NULL,
	"device_type" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"assigned_technician" text,
	"customer_info" json,
	"repair_notes" text,
	"estimated_value" real,
	"completion_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "devices_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "fleet_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"device_id" text NOT NULL,
	"device_model" text NOT NULL,
	"assigned_user" text,
	"status" text DEFAULT 'active' NOT NULL,
	"warranty_expiry" timestamp,
	"last_maintenance" timestamp,
	"deployment_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"price" real NOT NULL,
	"original_price" real,
	"description" text,
	"specifications" json,
	"warranty_years" integer DEFAULT 1,
	"stock_quantity" integer DEFAULT 0,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repair_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"serial_number" text NOT NULL,
	"device_model" text NOT NULL,
	"issue_description" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"assigned_technician" text,
	"estimated_completion" timestamp,
	"repair_notes" text,
	"customer_info" json,
	"status_history" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "repair_tickets_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE "trade_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_type" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"age" text NOT NULL,
	"condition" text NOT NULL,
	"estimated_value" real NOT NULL,
	"customer_info" json,
	"pickup_scheduled" boolean DEFAULT false,
	"status" text DEFAULT 'quoted' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'customer' NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"phone_number" text,
	"country_code" text,
	"city" text,
	"address" text,
	"account_type" text DEFAULT 'individual',
	"company_name" text,
	"industry" text,
	"company_size" text,
	"job_title" text,
	"primary_interest" text,
	"communication_preferences" json,
	"newsletter" boolean DEFAULT true,
	"agree_to_marketing" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial_number" text NOT NULL,
	"product_id" integer,
	"purchase_date" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"coverage" text NOT NULL,
	"invoice_number" text,
	"customer_email" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;