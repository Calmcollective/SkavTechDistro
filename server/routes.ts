import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertDeviceSchema, 
  insertWarrantySchema,
  insertRepairTicketSchema,
  insertTradeInSchema,
  insertFleetDeviceSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products endpoints
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const products = await storage.getProducts(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Trade-in endpoints
  app.post("/api/trade-in/estimate", async (req, res) => {
    try {
      const { deviceType, brand, model, age, condition } = req.body;
      
      if (!deviceType || !brand || !model || !age || !condition) {
        return res.status(400).json({ message: "All fields are required for trade-in estimation" });
      }

      // Trade-in value estimation logic
      let baseValue = 0;
      switch(deviceType) {
        case 'laptop': baseValue = 800; break;
        case 'desktop': baseValue = 600; break;
        case 'server': baseValue = 2000; break;
        case 'tablet': baseValue = 400; break;
        default: baseValue = 500;
      }

      let conditionMultiplier = 0.5;
      switch(condition) {
        case 'excellent': conditionMultiplier = 0.8; break;
        case 'good': conditionMultiplier = 0.65; break;
        case 'fair': conditionMultiplier = 0.45; break;
        case 'poor': conditionMultiplier = 0.25; break;
      }

      // Age depreciation
      let ageMultiplier = 1.0;
      switch(age) {
        case '0-1': ageMultiplier = 1.0; break;
        case '1-2': ageMultiplier = 0.8; break;
        case '2-3': ageMultiplier = 0.6; break;
        case '3-5': ageMultiplier = 0.4; break;
        case '5+': ageMultiplier = 0.2; break;
      }

      const estimatedValue = Math.round(baseValue * conditionMultiplier * ageMultiplier);

      res.json({ estimatedValue });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate trade-in estimate" });
    }
  });

  app.post("/api/trade-in", async (req, res) => {
    try {
      const validatedData = insertTradeInSchema.parse(req.body);
      const tradeIn = await storage.createTradeIn(validatedData);
      res.status(201).json(tradeIn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trade-in data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trade-in request" });
    }
  });

  // Warranty endpoints
  app.get("/api/warranty/:serialNumber", async (req, res) => {
    try {
      const serialNumber = req.params.serialNumber;
      const warranty = await storage.getWarrantyBySerial(serialNumber);
      
      if (!warranty) {
        return res.status(404).json({ message: "Warranty not found for this serial number" });
      }

      res.json(warranty);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warranty information" });
    }
  });

  // Repair ticket endpoints
  app.get("/api/repairs/:ticketId", async (req, res) => {
    try {
      const ticketId = req.params.ticketId;
      const ticket = await storage.getRepairTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Repair ticket not found" });
      }

      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repair ticket" });
    }
  });

  app.post("/api/repairs", async (req, res) => {
    try {
      const validatedData = insertRepairTicketSchema.parse(req.body);
      
      // Generate unique ticket ID
      const ticketId = `RPR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const ticket = await storage.createRepairTicket({
        ...validatedData,
        ticketId,
        statusHistory: [{
          status: "received",
          timestamp: new Date().toISOString(),
          notes: "Repair request submitted"
        }]
      });
      
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid repair ticket data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create repair ticket" });
    }
  });

  // Admin/Device management endpoints
  app.get("/api/admin/devices", async (req, res) => {
    try {
      const { status, technician } = req.query;
      const devices = await storage.getDevices({
        status: status as string,
        technician: technician as string
      });
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post("/api/admin/devices", async (req, res) => {
    try {
      const validatedData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(validatedData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/admin/devices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const device = await storage.updateDevice(id, updates);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      res.json(device);
    } catch (error) {
      res.status(500).json({ message: "Failed to update device" });
    }
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      
      const stats = {
        received: devices.filter(d => d.status === "received").length,
        in_repair: devices.filter(d => d.status === "repaired").length,
        qc: devices.filter(d => d.status === "qc").length,
        ready: devices.filter(d => d.status === "ready").length,
        total: devices.length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Fleet management endpoints
  app.get("/api/fleet/:companyId", async (req, res) => {
    try {
      const companyId = req.params.companyId;
      const devices = await storage.getFleetDevices(companyId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fleet devices" });
    }
  });

  app.get("/api/fleet/:companyId/stats", async (req, res) => {
    try {
      const companyId = req.params.companyId;
      const devices = await storage.getFleetDevices(companyId);
      
      const stats = {
        total: devices.length,
        active: devices.filter(d => d.status === "active").length,
        maintenance: devices.filter(d => d.status === "maintenance").length,
        expired: devices.filter(d => d.warrantyExpiry && d.warrantyExpiry < new Date()).length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fleet stats" });
    }
  });

  // Chatbot endpoint (basic AI simulation)
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Simple keyword-based responses
      let response = "Thank you for your message. How can I help you today?";
      
      if (message.toLowerCase().includes("warranty")) {
        response = "I can help you check your warranty status. Please provide your device serial number or invoice number.";
      } else if (message.toLowerCase().includes("repair")) {
        response = "For repair inquiries, you can track your repair status with a ticket ID or submit a new repair request. What would you like to do?";
      } else if (message.toLowerCase().includes("trade")) {
        response = "Our trade-in program offers competitive valuations for your old devices. What device would you like to trade in?";
      } else if (message.toLowerCase().includes("price") || message.toLowerCase().includes("cost")) {
        response = "You can view our current pricing on our products page, or request a custom quote for bulk orders.";
      }

      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Chatbot service temporarily unavailable" });
    }
  });

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Basic validation for Kenyan phone numbers
      const { phoneNumber, countryCode, ...userData } = req.body;
      
      if (countryCode !== "+254") {
        return res.status(400).json({ 
          message: "Registration is currently only available for Kenya (+254). We'll be expanding to other countries soon!"
        });
      }

      // Validate Kenyan phone number format
      const kenyanPhoneRegex = /^\+254[0-9]{9}$/;
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      
      if (!kenyanPhoneRegex.test(fullPhoneNumber)) {
        return res.status(400).json({ 
          message: "Please enter a valid Kenyan phone number (e.g., +254700123456)"
        });
      }

      const validatedData = insertUserSchema.parse({
        ...userData,
        phoneNumber: fullPhoneNumber
      });
      
      const user = await storage.createUser(validatedData);
      
      // Don't return password in response
      const { password, ...userResponse } = user;
      
      res.status(201).json({ 
        message: "Account created successfully",
        user: userResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // In a real app, you'd verify the password with bcrypt
      // For now, this is a placeholder
      const users = await storage.getUsers();
      const user = users.find(u => u.username === username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Don't return password in response
      const { password: _, ...userResponse } = user;
      
      res.json({ 
        message: "Login successful",
        user: userResponse
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
