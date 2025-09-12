import {
  users, products, devices, warranties, repairTickets, tradeIns, fleetDevices,
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Device, type InsertDevice,
  type Warranty, type InsertWarranty,
  type RepairTicket, type InsertRepairTicket,
  type TradeIn, type InsertTradeIn,
  type FleetDevice, type InsertFleetDevice
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { eq, and, desc } from "drizzle-orm";

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlite = new Database(connectionString.replace('file:', ''));
export const db = drizzle(sqlite, { logger: process.env.NODE_ENV === "development" });

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getProducts(category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;

  // Device methods
  getDevices(filters?: { status?: string; technician?: string }): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getDeviceBySerial(serialNumber: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, updates: Partial<Device>): Promise<Device | undefined>;

  // Warranty methods
  getWarrantyBySerial(serialNumber: string): Promise<Warranty | undefined>;
  createWarranty(warranty: InsertWarranty): Promise<Warranty>;

  // Repair ticket methods
  getRepairTickets(): Promise<RepairTicket[]>;
  getRepairTicket(ticketId: string): Promise<RepairTicket | undefined>;
  createRepairTicket(ticket: InsertRepairTicket): Promise<RepairTicket>;
  updateRepairTicket(ticketId: string, updates: Partial<RepairTicket>): Promise<RepairTicket | undefined>;

  // Trade-in methods
  createTradeIn(tradeIn: InsertTradeIn): Promise<TradeIn>;
  getTradeIns(): Promise<TradeIn[]>;

  // Fleet methods
  getFleetDevices(companyId: string): Promise<FleetDevice[]>;
  createFleetDevice(device: InsertFleetDevice): Promise<FleetDevice>;
}

export class DrizzleStorage implements IStorage {
  constructor() {
    // Database connection is already established above
  }

  // Helper method to convert timestamp to Date
  private timestampToDate(timestamp: number | null): Date | null {
    return timestamp ? new Date(timestamp * 1000) : null;
  }

  // Helper method to convert Date to timestamp
  private dateToTimestamp(date: Date | null): number | null {
    return date ? Math.floor(date.getTime() / 1000) : null;
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result.map(user => ({
      ...user,
      createdAt: this.timestampToDate(user.createdAt),
    }));
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (result.length === 0) return undefined;
    const user = result[0];
    return {
      ...user,
      createdAt: this.timestampToDate(user.createdAt),
    };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (result.length === 0) return undefined;
    const user = result[0];
    return {
      ...user,
      createdAt: this.timestampToDate(user.createdAt),
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      role: insertUser.role ?? "customer",
      email: insertUser.email ?? null,
      phoneNumber: insertUser.phoneNumber ?? null,
      countryCode: insertUser.countryCode ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      city: insertUser.city ?? null,
      address: insertUser.address ?? null,
      accountType: insertUser.accountType ?? "individual",
      companyName: insertUser.companyName ?? null,
      industry: insertUser.industry ?? null,
      companySize: insertUser.companySize ?? null,
      jobTitle: insertUser.jobTitle ?? null,
      primaryInterest: insertUser.primaryInterest ?? null,
      communicationPreferences: insertUser.communicationPreferences ?? null,
      newsletter: insertUser.newsletter ?? true,
      agreeToMarketing: insertUser.agreeToMarketing ?? false,
    }).returning();

    const user = result[0];
    return {
      ...user,
      createdAt: this.timestampToDate(user.createdAt),
    };
  }

  // Product methods
  async getProducts(category?: string): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));

    if (category && category !== "all") {
      query = db.select().from(products).where(
        and(eq(products.isActive, true), eq(products.category, category))
      );
    }

    const result = await query;
    return result.map(product => ({
      ...product,
      createdAt: product.createdAt ? new Date(product.createdAt) : null,
    }));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (result.length === 0) return undefined;
    const product = result[0];
    return {
      ...product,
      createdAt: product.createdAt ? new Date(product.createdAt) : null,
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values({
      ...insertProduct,
      originalPrice: insertProduct.originalPrice ?? null,
      description: insertProduct.description ?? null,
      specifications: insertProduct.specifications ?? {},
      warrantyYears: insertProduct.warrantyYears ?? 1,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      imageUrl: insertProduct.imageUrl ?? null,
      isActive: insertProduct.isActive ?? true,
    }).returning();

    const product = result[0];
    return {
      ...product,
      createdAt: product.createdAt ? new Date(product.createdAt) : null,
    };
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const result = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    if (result.length === 0) return undefined;
    const product = result[0];
    return {
      ...product,
      createdAt: product.createdAt ? new Date(product.createdAt) : null,
    };
  }

  // Device methods
  async getDevices(filters?: { status?: string; technician?: string }): Promise<Device[]> {
    let query = db.select().from(devices);

    if (filters?.status) {
      query = db.select().from(devices).where(eq(devices.status, filters.status));
    }

    if (filters?.technician) {
      query = db.select().from(devices).where(eq(devices.assignedTechnician, filters.technician));
    }

    const result = await query;
    return result.map(device => ({
      ...device,
      createdAt: this.timestampToDate(device.createdAt),
      updatedAt: this.timestampToDate(device.updatedAt),
      completionDate: this.timestampToDate(device.completionDate),
    })).sort((a, b) => {
      const aTime = a.updatedAt?.getTime() || 0;
      const bTime = b.updatedAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const result = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
    if (result.length === 0) return undefined;
    const device = result[0];
    return {
      ...device,
      createdAt: this.timestampToDate(device.createdAt),
      updatedAt: this.timestampToDate(device.updatedAt),
      completionDate: this.timestampToDate(device.completionDate),
    };
  }

  async getDeviceBySerial(serialNumber: string): Promise<Device | undefined> {
    const result = await db.select().from(devices).where(eq(devices.serialNumber, serialNumber)).limit(1);
    if (result.length === 0) return undefined;
    const device = result[0];
    return {
      ...device,
      createdAt: this.timestampToDate(device.createdAt),
      updatedAt: this.timestampToDate(device.updatedAt),
      completionDate: this.timestampToDate(device.completionDate),
    };
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const result = await db.insert(devices).values({
      ...insertDevice,
      status: insertDevice.status ?? "received",
      assignedTechnician: insertDevice.assignedTechnician ?? null,
      customerInfo: insertDevice.customerInfo ?? {},
      repairNotes: insertDevice.repairNotes ?? null,
      estimatedValue: insertDevice.estimatedValue ?? null,
      completionDate: this.dateToTimestamp(insertDevice.completionDate),
      createdAt: this.dateToTimestamp(new Date()),
      updatedAt: this.dateToTimestamp(new Date()),
    }).returning();

    const device = result[0];
    return {
      ...device,
      createdAt: this.timestampToDate(device.createdAt),
      updatedAt: this.timestampToDate(device.updatedAt),
      completionDate: this.timestampToDate(device.completionDate),
    };
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device | undefined> {
    const updateData: any = { ...updates };
    if (updates.completionDate !== undefined) {
      updateData.completionDate = this.dateToTimestamp(updates.completionDate);
    }
    updateData.updatedAt = this.dateToTimestamp(new Date());

    const result = await db.update(devices)
      .set(updateData)
      .where(eq(devices.id, id))
      .returning();

    if (result.length === 0) return undefined;
    const device = result[0];
    return {
      ...device,
      createdAt: this.timestampToDate(device.createdAt),
      updatedAt: this.timestampToDate(device.updatedAt),
      completionDate: this.timestampToDate(device.completionDate),
    };
  }

  // Warranty methods
  async getWarrantyBySerial(serialNumber: string): Promise<Warranty | undefined> {
    return Array.from(this.warranties.values())
      .find(w => w.serialNumber === serialNumber && w.isActive);
  }

  async createWarranty(insertWarranty: InsertWarranty): Promise<Warranty> {
    const id = this.currentWarrantyId++;
    const warranty: Warranty = {
      ...insertWarranty,
      id,
      isActive: insertWarranty.isActive ?? true,
      productId: insertWarranty.productId ?? null,
      invoiceNumber: insertWarranty.invoiceNumber ?? null,
      customerEmail: insertWarranty.customerEmail ?? null,
      createdAt: new Date()
    };
    this.warranties.set(id, warranty);
    return warranty;
  }

  // Repair ticket methods
  async getRepairTickets(): Promise<RepairTicket[]> {
    return Array.from(this.repairTickets.values())
      .sort((a, b) => {
        const aTime = a.updatedAt?.getTime() || 0;
        const bTime = b.updatedAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  async getRepairTicket(ticketId: string): Promise<RepairTicket | undefined> {
    return Array.from(this.repairTickets.values())
      .find(t => t.ticketId === ticketId);
  }

  async createRepairTicket(insertTicket: InsertRepairTicket): Promise<RepairTicket> {
    const id = this.currentRepairTicketId++;
    const ticket: RepairTicket = {
      ...insertTicket,
      id,
      status: insertTicket.status ?? "received",
      assignedTechnician: insertTicket.assignedTechnician ?? null,
      customerInfo: insertTicket.customerInfo ?? {},
      repairNotes: insertTicket.repairNotes ?? null,
      estimatedCompletion: insertTicket.estimatedCompletion ?? null,
      statusHistory: insertTicket.statusHistory ?? [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.repairTickets.set(id, ticket);
    return ticket;
  }

  async updateRepairTicket(ticketId: string, updates: Partial<RepairTicket>): Promise<RepairTicket | undefined> {
    const ticketEntry = Array.from(this.repairTickets.entries())
      .find(([_, ticket]) => ticket.ticketId === ticketId);
    
    if (!ticketEntry) return undefined;
    
    const [id, ticket] = ticketEntry;
    const updatedTicket = { ...ticket, ...updates, updatedAt: new Date() };
    this.repairTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // Trade-in methods
  async createTradeIn(insertTradeIn: InsertTradeIn): Promise<TradeIn> {
    const id = this.currentTradeInId++;
    const tradeIn: TradeIn = {
      ...insertTradeIn,
      id,
      status: insertTradeIn.status ?? "quoted",
      customerInfo: insertTradeIn.customerInfo ?? {},
      pickupScheduled: insertTradeIn.pickupScheduled ?? false,
      createdAt: new Date()
    };
    this.tradeIns.set(id, tradeIn);
    return tradeIn;
  }

  async getTradeIns(): Promise<TradeIn[]> {
    return Array.from(this.tradeIns.values())
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  // Fleet methods
  async getFleetDevices(companyId: string): Promise<FleetDevice[]> {
    return Array.from(this.fleetDevices.values())
      .filter(d => d.companyId === companyId)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  async createFleetDevice(insertDevice: InsertFleetDevice): Promise<FleetDevice> {
    const id = this.currentFleetDeviceId++;
    const device: FleetDevice = {
      ...insertDevice,
      id,
      status: insertDevice.status ?? "active",
      assignedUser: insertDevice.assignedUser ?? null,
      warrantyExpiry: insertDevice.warrantyExpiry ?? null,
      lastMaintenance: insertDevice.lastMaintenance ?? null,
      deploymentDate: insertDevice.deploymentDate ?? new Date(),
      createdAt: new Date()
    };
    this.fleetDevices.set(id, device);
    return device;
  }
}

export const storage = new DrizzleStorage();
