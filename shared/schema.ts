import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, admin, technician
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  countryCode: text("country_code"),
  city: text("city"),
  address: text("address"),
  accountType: text("account_type").default("individual"), // individual, business
  companyName: text("company_name"),
  industry: text("industry"),
  companySize: text("company_size"),
  jobTitle: text("job_title"),
  primaryInterest: text("primary_interest"),
  communicationPreferences: text("communication_preferences", { mode: 'json' }), // Array of strings
  newsletter: integer("newsletter", { mode: 'boolean' }).default(true),
  agreeToMarketing: integer("agree_to_marketing", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(), // servers, laptops, desktops, accessories
  condition: text("condition").notNull(), // new, refurbished
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  description: text("description"),
  specifications: text("specifications", { mode: 'json' }), // JSON object with specs
  warrantyYears: integer("warranty_years").default(1),
  stockQuantity: integer("stock_quantity").default(0),
  imageUrl: text("image_url"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const devices = sqliteTable("devices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serialNumber: text("serial_number").notNull().unique(),
  model: text("model").notNull(),
  brand: text("brand").notNull(),
  deviceType: text("device_type").notNull(),
  status: text("status").notNull().default("received"), // received, diagnosed, repaired, qc, ready
  assignedTechnician: text("assigned_technician"),
  customerInfo: text("customer_info", { mode: 'json' }),
  repairNotes: text("repair_notes"),
  estimatedValue: real("estimated_value"),
  completionDate: integer("completion_date", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const warranties = sqliteTable("warranties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serialNumber: text("serial_number").notNull(),
  productId: integer("product_id").references(() => products.id),
  purchaseDate: integer("purchase_date", { mode: 'timestamp' }).notNull(),
  expiryDate: integer("expiry_date", { mode: 'timestamp' }).notNull(),
  coverage: text("coverage").notNull(),
  invoiceNumber: text("invoice_number"),
  customerEmail: text("customer_email"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const repairTickets = sqliteTable("repair_tickets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticketId: text("ticket_id").notNull().unique(),
  serialNumber: text("serial_number").notNull(),
  deviceModel: text("device_model").notNull(),
  issueDescription: text("issue_description").notNull(),
  status: text("status").notNull().default("received"), // received, diagnosed, in_progress, qc, completed
  assignedTechnician: text("assigned_technician"),
  estimatedCompletion: integer("estimated_completion", { mode: 'timestamp' }),
  repairNotes: text("repair_notes"),
  customerInfo: text("customer_info", { mode: 'json' }),
  statusHistory: text("status_history", { mode: 'json' }), // Array of status updates
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const tradeIns = sqliteTable("trade_ins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  deviceType: text("device_type").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  age: text("age").notNull(),
  condition: text("condition").notNull(),
  estimatedValue: real("estimated_value").notNull(),
  customerInfo: text("customer_info", { mode: 'json' }),
  pickupScheduled: integer("pickup_scheduled", { mode: 'boolean' }).default(false),
  status: text("status").notNull().default("quoted"), // quoted, scheduled, collected, processed
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const fleetDevices = sqliteTable("fleet_devices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: text("company_id").notNull(),
  deviceId: text("device_id").notNull(),
  deviceModel: text("device_model").notNull(),
  assignedUser: text("assigned_user"),
  status: text("status").notNull().default("active"), // active, maintenance, retired
  warrantyExpiry: integer("warranty_expiry", { mode: 'timestamp' }),
  lastMaintenance: integer("last_maintenance", { mode: 'timestamp' }),
  deploymentDate: integer("deployment_date", { mode: 'timestamp' }).default(sql`(unixepoch())`),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  createdAt: true,
});

export const insertRepairTicketSchema = createInsertSchema(repairTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradeInSchema = createInsertSchema(tradeIns).omit({
  id: true,
  createdAt: true,
});

export const insertFleetDeviceSchema = createInsertSchema(fleetDevices).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;

export type Warranty = typeof warranties.$inferSelect;
export type InsertWarranty = z.infer<typeof insertWarrantySchema>;

export type RepairTicket = typeof repairTickets.$inferSelect;
export type InsertRepairTicket = z.infer<typeof insertRepairTicketSchema>;

export type TradeIn = typeof tradeIns.$inferSelect;
export type InsertTradeIn = z.infer<typeof insertTradeInSchema>;

export type FleetDevice = typeof fleetDevices.$inferSelect;
export type InsertFleetDevice = z.infer<typeof insertFleetDeviceSchema>;
