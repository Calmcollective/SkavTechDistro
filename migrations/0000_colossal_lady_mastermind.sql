CREATE TABLE "devices" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"serial_number" text NOT NULL,
	"model" text NOT NULL,
	"brand" text NOT NULL,
	"device_type" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"assigned_technician" text,
	"customer_info" text,
	"repair_notes" text,
	"estimated_value" real,
	"completion_date" integer,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch()),
	CONSTRAINT "devices_serial_number_unique" UNIQUE("serial_number")
);
CREATE TABLE "fleet_devices" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"company_id" text NOT NULL,
	"device_id" text NOT NULL,
	"device_model" text NOT NULL,
	"assigned_user" text,
	"status" text DEFAULT 'active' NOT NULL,
	"warranty_expiry" integer,
	"last_maintenance" integer,
	"deployment_date" integer DEFAULT (unixepoch()),
	"created_at" integer DEFAULT (unixepoch())
);
CREATE TABLE "products" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"name" text NOT NULL,
	"brand" text NOT NULL,
	"category" text NOT NULL,
	"condition" text NOT NULL,
	"price" real NOT NULL,
	"original_price" real,
	"description" text,
	"specifications" text,
	"warranty_years" integer DEFAULT 1,
	"stock_quantity" integer DEFAULT 0,
	"image_url" text,
	"is_active" integer DEFAULT 1,
	"created_at" integer DEFAULT (unixepoch())
);
CREATE TABLE "repair_tickets" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"ticket_id" text NOT NULL,
	"serial_number" text NOT NULL,
	"device_model" text NOT NULL,
	"issue_description" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"assigned_technician" text,
	"estimated_completion" integer,
	"repair_notes" text,
	"customer_info" text,
	"status_history" text,
	"created_at" integer DEFAULT (unixepoch()),
	"updated_at" integer DEFAULT (unixepoch()),
	CONSTRAINT "repair_tickets_ticket_id_unique" UNIQUE("ticket_id")
);
CREATE TABLE "trade_ins" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"device_type" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"age" text NOT NULL,
	"condition" text NOT NULL,
	"estimated_value" real NOT NULL,
	"customer_info" text,
	"pickup_scheduled" integer DEFAULT 0,
	"status" text DEFAULT 'quoted' NOT NULL,
	"created_at" integer DEFAULT (unixepoch())
);
CREATE TABLE "users" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
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
	"communication_preferences" text,
	"newsletter" integer DEFAULT 1,
	"agree_to_marketing" integer DEFAULT 0,
	"created_at" integer DEFAULT (unixepoch()),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
CREATE TABLE "warranties" (
	"id" INTEGER PRIMARY KEY AUTOINCREMENT,
	"serial_number" text NOT NULL,
	"product_id" integer,
	"purchase_date" integer NOT NULL,
	"expiry_date" integer NOT NULL,
	"coverage" text NOT NULL,
	"invoice_number" text,
	"customer_email" text,
	"is_active" integer DEFAULT 1,
	"created_at" integer DEFAULT (unixepoch())
);
