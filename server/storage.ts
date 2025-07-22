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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private products: Map<number, Product> = new Map();
  private devices: Map<number, Device> = new Map();
  private warranties: Map<number, Warranty> = new Map();
  private repairTickets: Map<number, RepairTicket> = new Map();
  private tradeIns: Map<number, TradeIn> = new Map();
  private fleetDevices: Map<number, FleetDevice> = new Map();
  
  private currentUserId = 1;
  private currentProductId = 1;
  private currentDeviceId = 1;
  private currentWarrantyId = 1;
  private currentRepairTicketId = 1;
  private currentTradeInId = 1;
  private currentFleetDeviceId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial products
    const sampleProducts: Product[] = [
      {
        id: this.currentProductId++,
        name: "Dell PowerEdge R750",
        brand: "Dell",
        category: "servers",
        condition: "refurbished",
        price: 4299,
        originalPrice: 6500,
        description: "Enterprise-grade server with dual Xeon processors and 64GB RAM",
        specifications: {
          processor: "Dual Intel Xeon",
          ram: "64GB",
          storage: "2TB SSD",
          ports: "Multiple USB, Ethernet"
        },
        warrantyYears: 2,
        stockQuantity: 5,
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: this.currentProductId++,
        name: "Lenovo ThinkPad T14",
        brand: "Lenovo",
        category: "laptops",
        condition: "new",
        price: 1299,
        originalPrice: null,
        description: "Business laptop with Intel i7, 16GB RAM, and 512GB SSD",
        specifications: {
          processor: "Intel i7",
          ram: "16GB",
          storage: "512GB SSD",
          screen: "14-inch Full HD"
        },
        warrantyYears: 3,
        stockQuantity: 12,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        isActive: true,
        createdAt: new Date()
      },
      {
        id: this.currentProductId++,
        name: "HP EliteDesk 800 G6",
        brand: "HP",
        category: "desktops",
        condition: "refurbished",
        price: 549,
        originalPrice: 899,
        description: "Compact business desktop with Intel i5 and 8GB RAM",
        specifications: {
          processor: "Intel i5",
          ram: "8GB",
          storage: "256GB SSD",
          ports: "Multiple USB, DisplayPort"
        },
        warrantyYears: 1,
        stockQuantity: 8,
        imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        isActive: true,
        createdAt: new Date()
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Seed devices for admin dashboard
    const sampleDevices: Device[] = [
      {
        id: this.currentDeviceId++,
        serialNumber: "DL7420-2023-001",
        model: "Dell Latitude 7420",
        brand: "Dell",
        deviceType: "laptop",
        status: "repaired",
        assignedTechnician: "John Smith",
        customerInfo: { name: "Corporate Client A", email: "client@company.com" },
        repairNotes: "Screen replacement completed",
        estimatedValue: 850,
        completionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.currentDeviceId++,
        serialNumber: "HP850-2023-025",
        model: "HP EliteBook 850",
        brand: "HP",
        deviceType: "laptop",
        status: "ready",
        assignedTechnician: "Sarah Johnson",
        customerInfo: { name: "Individual Customer", email: "customer@email.com" },
        repairNotes: "Quality check passed",
        estimatedValue: 750,
        completionDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleDevices.forEach(device => {
      this.devices.set(device.id, device);
    });

    // Seed warranties
    const sampleWarranties: Warranty[] = [
      {
        id: this.currentWarrantyId++,
        serialNumber: "DL7420-CORP-001",
        productId: 1,
        purchaseDate: new Date("2023-03-15"),
        expiryDate: new Date("2026-03-15"),
        coverage: "3-Year Hardware & Software Support",
        invoiceNumber: "INV-2023-001",
        customerEmail: "john@company.com",
        isActive: true,
        createdAt: new Date()
      }
    ];

    sampleWarranties.forEach(warranty => {
      this.warranties.set(warranty.id, warranty);
    });

    // Seed repair tickets
    const sampleTickets: RepairTicket[] = [
      {
        id: this.currentRepairTicketId++,
        ticketId: "RPR-2024-001",
        serialNumber: "DL7420-CORP-001",
        deviceModel: "Dell Latitude 7420",
        issueDescription: "Screen flickering issue",
        status: "in_progress",
        assignedTechnician: "John Smith",
        estimatedCompletion: new Date("2024-01-20"),
        repairNotes: "Diagnosed display cable issue",
        customerInfo: { name: "John Doe", email: "john@company.com", phone: "+254700123456" },
        statusHistory: [
          { status: "received", timestamp: "2024-01-15T09:00:00Z", notes: "Device received" },
          { status: "diagnosed", timestamp: "2024-01-16T14:30:00Z", notes: "Diagnosis complete" },
          { status: "in_progress", timestamp: "2024-01-17T10:00:00Z", notes: "Repair started" }
        ],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date()
      }
    ];

    sampleTickets.forEach(ticket => {
      this.repairTickets.set(ticket.id, ticket);
    });

    // Seed fleet devices
    const sampleFleetDevices: FleetDevice[] = [
      {
        id: this.currentFleetDeviceId++,
        companyId: "CORP-001",
        deviceId: "DL7420-CORP-001",
        deviceModel: "Dell Latitude 7420",
        assignedUser: "John Doe",
        status: "active",
        warrantyExpiry: new Date("2025-12-31"),
        lastMaintenance: new Date("2024-01-01"),
        deploymentDate: new Date("2023-01-15"),
        createdAt: new Date()
      },
      {
        id: this.currentFleetDeviceId++,
        companyId: "CORP-001",
        deviceId: "MBP14-CORP-015",
        deviceModel: "MacBook Pro 14\"",
        assignedUser: "Sarah Smith",
        status: "maintenance",
        warrantyExpiry: new Date("2024-08-31"),
        lastMaintenance: new Date("2024-01-10"),
        deploymentDate: new Date("2022-08-15"),
        createdAt: new Date()
      }
    ];

    sampleFleetDevices.forEach(device => {
      this.fleetDevices.set(device.id, device);
    });
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(category?: string): Promise<Product[]> {
    const allProducts = Array.from(this.products.values()).filter(p => p.isActive);
    if (category && category !== "all") {
      return allProducts.filter(p => p.category === category);
    }
    return allProducts;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Device methods
  async getDevices(filters?: { status?: string; technician?: string }): Promise<Device[]> {
    let devices = Array.from(this.devices.values());
    
    if (filters?.status) {
      devices = devices.filter(d => d.status === filters.status);
    }
    
    if (filters?.technician) {
      devices = devices.filter(d => d.assignedTechnician === filters.technician);
    }
    
    return devices.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceBySerial(serialNumber: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(d => d.serialNumber === serialNumber);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const device: Device = { 
      ...insertDevice, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<Device>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    const updatedDevice = { ...device, ...updates, updatedAt: new Date() };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
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
      createdAt: new Date() 
    };
    this.warranties.set(id, warranty);
    return warranty;
  }

  // Repair ticket methods
  async getRepairTickets(): Promise<RepairTicket[]> {
    return Array.from(this.repairTickets.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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
      createdAt: new Date() 
    };
    this.tradeIns.set(id, tradeIn);
    return tradeIn;
  }

  async getTradeIns(): Promise<TradeIn[]> {
    return Array.from(this.tradeIns.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Fleet methods
  async getFleetDevices(companyId: string): Promise<FleetDevice[]> {
    return Array.from(this.fleetDevices.values())
      .filter(d => d.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createFleetDevice(insertDevice: InsertFleetDevice): Promise<FleetDevice> {
    const id = this.currentFleetDeviceId++;
    const device: FleetDevice = { 
      ...insertDevice, 
      id, 
      createdAt: new Date() 
    };
    this.fleetDevices.set(id, device);
    return device;
  }
}

export const storage = new MemStorage();
