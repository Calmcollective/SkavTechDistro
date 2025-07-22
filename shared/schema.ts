import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, admin, technician
  email: text("email"),
  phoneNumber: text("phone_number"),
  accountType: text("account_type").default("individual"), // individual, business
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(), // servers, laptops, desktops, accessories
  condition: text("condition").notNull(), // new, refurbished
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  description: text("description"),
  specifications: json("specifications"), // JSON object with specs
  warrantyYears: integer("warranty_years").default(1),
  stockQuantity: integer("stock_quantity").default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(),
  model: text("model").notNull(),
  brand: text("brand").notNull(),
  deviceType: text("device_type").notNull(),
  status: text("status").notNull().default("received"), // received, diagnosed, repaired, qc, ready
  assignedTechnician: text("assigned_technician"),
  customerInfo: json("customer_info"),
  repairNotes: text("repair_notes"),
  estimatedValue: real("estimated_value"),
  completionDate: timestamp("completion_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const warranties = pgTable("warranties", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull(),
  productId: integer("product_id").references(() => products.id),
  purchaseDate: timestamp("purchase_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  coverage: text("coverage").notNull(),
  invoiceNumber: text("invoice_number"),
  customerEmail: text("customer_email"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const repairTickets = pgTable("repair_tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  serialNumber: text("serial_number").notNull(),
  deviceModel: text("device_model").notNull(),
  issueDescription: text("issue_description").notNull(),
  status: text("status").notNull().default("received"), // received, diagnosed, in_progress, qc, completed
  assignedTechnician: text("assigned_technician"),
  estimatedCompletion: timestamp("estimated_completion"),
  repairNotes: text("repair_notes"),
  customerInfo: json("customer_info"),
  statusHistory: json("status_history"), // Array of status updates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradeIns = pgTable("trade_ins", {
  id: serial("id").primaryKey(),
  deviceType: text("device_type").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  age: text("age").notNull(),
  condition: text("condition").notNull(),
  estimatedValue: real("estimated_value").notNull(),
  customerInfo: json("customer_info"),
  pickupScheduled: boolean("pickup_scheduled").default(false),
  status: text("status").notNull().default("quoted"), // quoted, scheduled, collected, processed
  createdAt: timestamp("created_at").defaultNow(),
});

export const fleetDevices = pgTable("fleet_devices", {
  id: serial("id").primaryKey(),
  companyId: text("company_id").notNull(),
  deviceId: text("device_id").notNull(),
  deviceModel: text("device_model").notNull(),
  assignedUser: text("assigned_user"),
  status: text("status").notNull().default("active"), // active, maintenance, retired
  warrantyExpiry: timestamp("warranty_expiry"),
  lastMaintenance: timestamp("last_maintenance"),
  deploymentDate: timestamp("deployment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
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
