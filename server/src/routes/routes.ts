import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
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

// Trade-in estimate request schema
const tradeInEstimateSchema = z.object({
  deviceType: z.enum(["laptop", "desktop", "server", "tablet"]).refine((val) => {
    return ["laptop", "desktop", "server", "tablet"].includes(val);
  }, { message: "Device type must be laptop, desktop, server, or tablet" }),
  brand: z.string().min(1, "Brand is required").max(50, "Brand name too long"),
  model: z.string().min(1, "Model is required").max(100, "Model name too long"),
  age: z.enum(["0-1", "1-2", "2-3", "3-5", "5+"]).refine((val) => {
    return ["0-1", "1-2", "2-3", "3-5", "5+"].includes(val);
  }, { message: "Age must be one of: 0-1, 1-2, 2-3, 3-5, 5+" }),
  condition: z.enum(["excellent", "good", "fair", "poor"]).refine((val) => {
    return ["excellent", "good", "fair", "poor"].includes(val);
  }, { message: "Condition must be excellent, good, fair, or poor" })
});

type TradeInEstimateRequest = z.infer<typeof tradeInEstimateSchema>;

// Generate product comparison data
function generateProductComparison(products: any[]) {
  if (products.length < 2) return null;

  const comparison = {
    priceComparison: {
      lowest: Math.min(...products.map(p => p.price)),
      highest: Math.max(...products.map(p => p.price)),
      average: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length),
      savings: products.map(p => {
        if (p.originalPrice && p.originalPrice > p.price) {
          return p.originalPrice - p.price;
        }
        return 0;
      })
    },
    warrantyComparison: {
      best: Math.max(...products.map(p => p.warrantyYears || 0)),
      average: Math.round(products.reduce((sum, p) => sum + (p.warrantyYears || 0), 0) / products.length)
    },
    conditionBreakdown: products.reduce((acc, p) => {
      acc[p.condition] = (acc[p.condition] || 0) + 1;
      return acc;
    }, {}),
    categoryBreakdown: products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}),
    brandDiversity: Array.from(new Set(products.map(p => p.brand))).length,
    recommendations: generateComparisonRecommendations(products)
  };

  return comparison;
}

// Generate smart recommendations based on comparison
function generateComparisonRecommendations(products: any[]) {
  const recommendations = [];

  // Price-based recommendation
  const cheapest = products.reduce((min, p) => p.price < min.price ? p : min);
  recommendations.push({
    type: "best_value",
    product: cheapest,
    reason: `Best value at $${cheapest.price.toLocaleString()}`
  });

  // Warranty-based recommendation
  const bestWarranty = products.reduce((best, p) =>
    (p.warrantyYears || 0) > (best.warrantyYears || 0) ? p : best
  );
  if (bestWarranty.warrantyYears > 1) {
    recommendations.push({
      type: "best_warranty",
      product: bestWarranty,
      reason: `Longest warranty (${bestWarranty.warrantyYears} years)`
    });
  }

  // New condition preference
  const newProducts = products.filter(p => p.condition === "new");
  if (newProducts.length > 0) {
    const newest = newProducts[0]; // Could be enhanced to find most recent
    recommendations.push({
      type: "new_condition",
      product: newest,
      reason: "Brand new condition"
    });
  }

  return recommendations;
}

// Calculate trade-in estimate function
function calculateEstimate(data: TradeInEstimateRequest): number {
  const { deviceType, brand, model, age, condition } = data;

  // Base values by device type
  const baseValues: Record<string, number> = {
    laptop: 800,
    desktop: 600,
    server: 2000,
    tablet: 400
  };

  // Brand multipliers (premium brands get higher values)
  const brandMultipliers: Record<string, number> = {
    apple: 1.3,
    dell: 1.1,
    hp: 1.1,
    lenovo: 1.1,
    asus: 1.0,
    default: 1.0
  };

  // Condition multipliers
  const conditionMultipliers: Record<string, number> = {
    excellent: 0.9,
    good: 0.75,
    fair: 0.55,
    poor: 0.3
  };

  // Age depreciation multipliers
  const ageMultipliers: Record<string, number> = {
    "0-1": 1.0,
    "1-2": 0.85,
    "2-3": 0.7,
    "3-5": 0.5,
    "5+": 0.25
  };

  // Model-specific adjustments (popular models get slight premium)
  const popularModels = [
    "macbook pro", "thinkpad", "latitude", "elitebook", "xps",
    "poweredge", "proliant", "thinksystem"
  ];
  const isPopularModel = popularModels.some(pm =>
    model.toLowerCase().includes(pm.toLowerCase())
  );

  // Calculate base estimate
  let estimate = baseValues[deviceType] || 500;

  // Apply brand multiplier
  const brandMultiplier = brandMultipliers[brand.toLowerCase()] || brandMultipliers.default;
  estimate *= brandMultiplier;

  // Apply condition multiplier
  estimate *= conditionMultipliers[condition];

  // Apply age depreciation
  estimate *= ageMultipliers[age];

  // Apply model popularity bonus
  if (isPopularModel) {
    estimate *= 1.1;
  }

  // Add some randomization (±5%) to make estimates feel more realistic
  const randomFactor = 0.95 + (Math.random() * 0.1);
  estimate *= randomFactor;

  // Round to nearest $10
  return Math.round(estimate / 10) * 10;
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

// Admin role middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any).role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};

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
        return res.status(400).json({ message: "Invalid product data", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Comparison endpoints
  app.post("/api/comparison", async (req, res) => {
    try {
      const { productIds } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length < 2 || productIds.length > 3) {
        return res.status(400).json({
          message: "Please provide 2-3 product IDs for comparison"
        });
      }

      // Fetch products by IDs
      const products = [];
      for (const id of productIds) {
        const product = await storage.getProduct(id);
        if (product) {
          products.push(product);
        }
      }

      if (products.length < 2) {
        return res.status(404).json({
          message: "Not enough valid products found for comparison"
        });
      }

      // Generate comparison data
      const comparison = generateProductComparison(products);

      res.json({
        products,
        comparison
      });
    } catch (error) {
      console.error("Comparison error:", error);
      res.status(500).json({ message: "Failed to generate product comparison" });
    }
  });

  // Trade-in endpoints
  app.post("/api/trade-in/estimate", async (req, res) => {
    try {
      // Validate request payload with Zod
      const validatedData = tradeInEstimateSchema.parse(req.body);

      // Calculate estimate using dedicated function
      const estimatedValue = calculateEstimate(validatedData);

      // Log the estimation for analytics
      console.log(`Trade-in estimate calculated: ${validatedData.brand} ${validatedData.model} (${validatedData.condition}) - $${estimatedValue}`);

      res.json({
        estimatedValue,
        breakdown: {
          deviceType: validatedData.deviceType,
          brand: validatedData.brand,
          model: validatedData.model,
          age: validatedData.age,
          condition: validatedData.condition
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid trade-in data",
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      console.error("Trade-in estimate error:", error);
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
        return res.status(400).json({ message: "Invalid trade-in data", errors: error.issues });
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
        return res.status(400).json({ message: "Invalid repair ticket data", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to create repair ticket" });
    }
  });

  // Admin/Device management endpoints
  app.get("/api/admin/devices", requireAdmin, async (req, res) => {
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

  app.post("/api/admin/devices", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(validatedData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid device data", errors: error.issues });
      }
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  app.patch("/api/admin/devices/:id", requireAdmin, async (req, res) => {
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
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
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
  app.get("/api/fleet/:companyId", requireAuth, async (req, res) => {
    try {
      const companyId = req.params.companyId;
      const devices = await storage.getFleetDevices(companyId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fleet devices" });
    }
  });

  app.get("/api/fleet/:companyId/stats", requireAuth, async (req, res) => {
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

  // Chatbot endpoint (enhanced AI simulation)
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: "Message is required" });
      }

      const input = message.toLowerCase();
      let response = "";

      // Enhanced multi-paragraph responses
      if (input.includes("warranty") || input.includes("guarantee")) {
        response = `I can help you check your warranty status! Here's what you need to know:

• **Warranty Coverage**: Our devices come with comprehensive hardware and software support
• **Duration**: Typically 1-3 years depending on the product type
• **What's Covered**: Hardware defects, manufacturing issues, and software support
• **How to Check**: Visit our Services page and enter your device serial number

To get started, please provide your device serial number or invoice number, and I'll look up your warranty details right away!`;
      }

      else if (input.includes("repair") || input.includes("fix") || input.includes("broken")) {
        response = `We offer comprehensive repair services for all ICT devices. Here's how it works:

**Our Repair Process:**
1. **Initial Assessment** - Quick diagnostic review (usually within 24 hours)
2. **Detailed Diagnosis** - Complete hardware and software testing
3. **Repair Quote** - Transparent pricing with no hidden fees
4. **Professional Repair** - Certified technicians using quality parts
5. **Quality Assurance** - Rigorous testing before return

**What We Repair:**
• Laptops, desktops, and servers
• Hardware components and peripherals
• Software issues and data recovery
• Network equipment and accessories

**Next Steps:**
• Submit a repair request on our Services page
• Track your repair status in real-time
• Get updates via email and SMS

Would you like me to help you submit a repair request or check the status of an existing repair?`;
      }

      else if (input.includes("trade") || input.includes("sell") || input.includes("trade-in")) {
        response = `Our trade-in program offers competitive valuations for your used devices! Here's everything you need to know:

**Why Choose Our Trade-In Program:**
• **Best Market Value** - Competitive pricing based on current market conditions
• **Free Collection** - Complimentary pickup service anywhere in Kenya
• **Secure Data Wiping** - Professional data destruction with certification
• **Eco-Friendly** - Responsible recycling and refurbishment practices
• **Instant Payment** - Get paid upon successful inspection

**Supported Devices:**
• Laptops and notebooks
• Desktop computers
• Servers and workstations
• Tablets and mobile devices
• Networking equipment

**How It Works:**
1. **Get Instant Quote** - Use our online valuation tool
2. **Schedule Pickup** - Choose a convenient time and location
3. **Device Inspection** - Our experts verify condition and specifications
4. **Receive Payment** - Instant payment upon approval

**Current Special Offers:**
• Up to 70% of original value for devices under 2 years old
• Bonus payments for high-demand models
• Trade-in credits toward new purchases

Ready to get started? Visit our Trade-In page to get your instant quote!`;
      }

      else if (input.includes("price") || input.includes("cost") || input.includes("pricing")) {
        response = `We offer competitive pricing with transparent costs. Here's our pricing structure:

**Product Categories & Pricing:**

**Laptops & Notebooks:**
• Business laptops: KSh 45,000 - KSh 150,000
• Gaming laptops: KSh 80,000 - KSh 250,000
• Ultrabooks: KSh 60,000 - KSh 180,000

**Desktop Computers:**
• Office desktops: KSh 35,000 - KSh 80,000
• Gaming desktops: KSh 70,000 - KSh 200,000
• All-in-one PCs: KSh 55,000 - KSh 120,000

**Servers & Workstations:**
• Entry-level servers: KSh 120,000 - KSh 300,000
• Mid-range servers: KSh 250,000 - KSh 600,000
• High-end servers: KSh 500,000 - KSh 2,000,000+

**Special Offers:**
• **Refurbished Savings**: Up to 40% off new prices
• **Bulk Discounts**: 10-25% off for orders of 5+ units
• **Educational Pricing**: Special rates for schools and universities
• **Government Contracts**: Competitive pricing for public sector

**Additional Services:**
• Extended warranties: 10-20% of product cost
• Installation & setup: KSh 5,000 - KSh 15,000
• Training & support: KSh 10,000 - KSh 25,000
• Maintenance packages: Monthly from KSh 2,000

**Payment Options:**
• Cash, card, and bank transfers
• Leasing options available
• Purchase financing through partners
• Government procurement terms

Would you like me to help you find specific products within your budget or get a custom quote for your requirements?`;
      }

      else if (input.includes("fleet") || input.includes("business") || input.includes("enterprise") || input.includes("corporate")) {
        response = `Our Corporate Fleet Portal is designed for enterprise device management. Here's what we offer:

**Fleet Management Features:**

**Device Lifecycle Management:**
• Complete device inventory tracking
• Automated warranty management
• Maintenance scheduling and reminders
• End-of-life planning and disposal

**Real-time Analytics & Reporting:**
• Device utilization metrics
• Cost analysis and ROI tracking
• Maintenance cost forecasting
• Compliance reporting

**User Management:**
• Employee device assignments
• Role-based access control
• Self-service device requests
• Automated provisioning

**Support & Maintenance:**
• 24/7 technical support
• On-site service options
• Remote monitoring and management
• Emergency response services

**Benefits for Your Business:**
• **Cost Savings**: Reduce IT costs by up to 40%
• **Increased Productivity**: Minimize downtime with proactive maintenance
• **Better Compliance**: Automated reporting and audit trails
• **Scalable Solution**: Grows with your business needs

**Enterprise Solutions Include:**
• Custom integration with existing IT systems
• Dedicated account management
• Priority support and faster response times
• Volume discounts and flexible pricing
• Custom reporting and analytics

**Getting Started:**
1. **Contact Sales**: Schedule a demo or consultation
2. **Account Setup**: We'll help migrate your existing inventory
3. **Staff Training**: Comprehensive training for your IT team
4. **Go-Live Support**: Assisted rollout and ongoing support

**Current Enterprise Clients:**
• Over 50 companies trust Skavtech for their ICT needs
• Average 99.9% uptime across all managed devices
• 24/7 support with average response time under 2 hours

Would you like me to arrange a demo or connect you with our enterprise sales team?`;
      }

      else if (input.includes("server") || input.includes("servers")) {
        response = `We specialize in enterprise-grade servers for businesses of all sizes. Here's our server portfolio:

**Server Categories:**

**Entry-Level Servers (1-50 users):**
• Dell PowerEdge T150: Perfect for small businesses
• HPE ProLiant ML110: Reliable workgroup server
• Supermicro SYS-1019P: Cost-effective entry point

**Mid-Range Servers (50-200 users):**
• Dell PowerEdge R450: Balanced performance and features
• HPE ProLiant DL380: Industry-standard reliability
• Lenovo ThinkSystem SR650: Scalable and efficient

**High-End Servers (200+ users):**
• Dell PowerEdge R750: Enterprise-grade performance
• HPE ProLiant DL560: Maximum processing power
• Cisco UCS C240: Cloud-ready infrastructure

**Specialized Servers:**
• **Storage Servers**: High-capacity data storage solutions
• **GPU Servers**: For AI/ML and graphics-intensive workloads
• **Database Servers**: Optimized for database applications
• **Web Servers**: High-throughput web hosting solutions

**Key Features:**
• **Reliability**: 99.9%+ uptime with redundant components
• **Scalability**: Easy expansion as your business grows
• **Security**: Enterprise-grade security features
• **Support**: 24/7 technical support and maintenance

**Pricing Range:**
• Entry-level: KSh 150,000 - KSh 400,000
• Mid-range: KSh 350,000 - KSh 800,000
• High-end: KSh 700,000 - KSh 3,000,000+

**Included Services:**
• Professional installation and configuration
• 3-year warranty with next-business-day support
• Migration assistance from existing systems
• Training for your IT staff

Would you like me to recommend a server based on your specific requirements or help you get a custom quote?`;
      }

      else if (input.includes("laptop") || input.includes("notebook") || input.includes("computer")) {
        response = `We offer a comprehensive range of laptops and computers for every need. Here's our selection:

**Business Laptops:**
• **Dell Latitude Series**: Reliable business performance
• **Lenovo ThinkPad T14s**: Premium business features
• **HP EliteBook 840**: Security-focused enterprise laptop

**Professional Laptops:**
• **Apple MacBook Pro 14"**: Creative professional work
• **Dell XPS 13**: Premium ultrabook experience
• **Lenovo ThinkPad X1**: Ultimate business mobility

**Gaming & Performance:**
• **ASUS ROG Strix G15**: High-performance gaming
• **Dell Alienware m15**: Premium gaming experience
• **HP Omen 16**: Balanced gaming and productivity

**Budget-Friendly Options:**
• **Dell Inspiron 15**: Affordable everyday computing
• **Lenovo IdeaPad 3**: Student and home use
• **HP Pavilion 14**: Versatile everyday laptop

**Key Specifications:**
• **Processors**: Intel Core i3/i5/i7/i9, AMD Ryzen 3/5/7/9
• **Memory**: 8GB to 64GB RAM options
• **Storage**: SSD from 256GB to 2TB
• **Displays**: HD to 4K resolution options
• **Battery Life**: 6-18 hours depending on model

**Pricing Guide:**
• **Entry-level**: KSh 35,000 - KSh 60,000
• **Mid-range**: KSh 55,000 - KSh 100,000
• **Premium**: KSh 90,000 - KSh 250,000+
• **Gaming**: KSh 80,000 - KSh 350,000+

**Additional Options:**
• Extended warranties (1-3 years)
• Accidental damage protection
• On-site service contracts
• Data backup and recovery services

What type of laptop are you looking for? I can help you find the perfect match for your needs and budget!`;
      }

      else if (input.includes("contact") || input.includes("support") || input.includes("help") || input.includes("phone") || input.includes("email")) {
        response = `We're here to help! Here are all the ways to reach our team:

**Customer Support:**
• **Phone**: +254 700 123 456 (Mon-Fri, 8AM-6PM EAT)
• **Email**: support@skavtech.co.ke
• **WhatsApp**: +254 700 123 456 (24/7 for urgent issues)

**Sales & Quotations:**
• **Phone**: +254 711 123 456
• **Email**: sales@skavtech.co.ke
• **Website**: www.skavtech.co.ke/request-quote

**Technical Support:**
• **Phone**: +254 722 123 456
• **Email**: tech@skavtech.co.ke
• **Emergency**: +254 733 123 456 (24/7)

**Business Hours:**
• **Monday - Friday**: 8:00 AM - 6:00 PM EAT
• **Saturday**: 9:00 AM - 4:00 PM EAT
• **Sunday**: Emergency support only

**Office Locations:**
• **Nairobi Headquarters**: Westlands, Nairobi
• **Mombasa Branch**: Mombasa CBD
• **Kisumu Office**: Kisumu City Center

**Response Times:**
• **Email**: Within 2-4 hours during business hours
• **Phone**: Immediate during business hours
• **Emergency**: Within 1 hour, 24/7

**Popular Support Topics:**
• Warranty claims and status
• Repair tracking and updates
• Product information and specifications
• Trade-in valuations and scheduling
• Fleet management support
• Technical troubleshooting

How can we assist you today? Feel free to call, email, or use our live chat!`;
      }

      else if (input.includes("about") || input.includes("company") || input.includes("skavtech")) {
        response = `Welcome to Skavtech! We're Kenya's leading ICT hardware distribution and service company. Here's our story:

**About Skavtech Solutions Ltd:**

**Our Mission:**
To provide cutting-edge ICT solutions that empower businesses and individuals across Kenya and East Africa, combining quality products with exceptional service.

**Our Vision:**
To be the most trusted ICT partner in East Africa, known for innovation, reliability, and customer-centric solutions.

**Company History:**
• **Founded**: 2018 in Nairobi, Kenya
• **Growth**: From a small startup to serving 500+ enterprise clients
• **Expansion**: Multiple office locations across major Kenyan cities
• **Recognition**: Awarded "Best ICT Distributor 2023" by Kenya ICT Association

**What We Do:**
• **Hardware Distribution**: Servers, laptops, desktops, networking equipment
• **Refurbishment Services**: Certified refurbished devices with warranty
• **Repair & Maintenance**: Professional repair services with quick turnaround
• **Trade-In Program**: Competitive valuations for used equipment
• **Fleet Management**: Enterprise device lifecycle management
• **Consulting Services**: ICT infrastructure planning and implementation

**Our Values:**
• **Quality**: Only certified, reliable products and services
• **Integrity**: Transparent pricing and honest business practices
• **Innovation**: Staying ahead with latest technology trends
• **Sustainability**: Eco-friendly practices and responsible recycling
• **Community**: Supporting local businesses and education initiatives

**Certifications & Partnerships:**
• Microsoft Gold Partner
• Dell Preferred Partner
• HPE Authorized Distributor
• Lenovo Business Partner
• ISO 9001:2015 Certified
• Member of Kenya ICT Association

**Our Team:**
• 50+ dedicated professionals
• Certified technicians and engineers
• Customer service specialists
• Sales and business development experts

**Impact & Reach:**
• Serving clients across all Kenyan counties
• Supporting businesses from startups to Fortune 500 companies
• Contributing to digital transformation initiatives
• Creating employment and supporting local economy

**Why Choose Skavtech:**
• Local expertise with global standards
• Comprehensive service portfolio
• Competitive pricing with quality guarantee
• Fast, reliable delivery across Kenya
• 24/7 support and emergency services

We're more than just an ICT distributor - we're your technology partner for success!`;
      }

      else {
        response = `Thank you for reaching out to Skavtech! I'm here to help with all your ICT needs.

**How I Can Assist You:**

**Product Information:**
• Browse our catalog of servers, laptops, and networking equipment
• Get detailed specifications and pricing
• Compare products side-by-side
• Request custom quotes for bulk orders

**Services & Support:**
• Warranty status checking and claims
• Repair request submission and tracking
• Trade-in valuations and scheduling
• Fleet management solutions

**Business Solutions:**
• Enterprise device procurement
• IT infrastructure consulting
• Maintenance and support packages
• Custom solutions for your industry

**Quick Actions:**
• Visit our Products page to browse inventory
• Use our Trade-In tool for instant valuations
• Check Services page for warranty and repair support
• Explore Fleet portal for enterprise solutions

**Popular Topics:**
• Server specifications and recommendations
• Laptop comparisons and buying guides
• Repair process and timeline information
• Warranty coverage and claim procedures
• Trade-in program details and benefits

What specific information are you looking for? I can provide detailed answers about any of our products or services!`;
      }

      res.json({ response });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({
        message: "Chatbot service temporarily unavailable",
        response: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team directly at support@skavtech.co.ke or +254 700 123 456."
      });
    }
  });

  // Authentication endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Basic validation for Kenyan phone numbers
      const { phoneNumber, countryCode, password, ...userData } = req.body;

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

      // Hash password before saving
      const bcrypt = await import('bcrypt');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const validatedData = insertUserSchema.parse({
        ...userData,
        phoneNumber: fullPhoneNumber,
        password: hashedPassword
      });

      const user = await storage.createUser(validatedData);

      // Don't return password in response
      const { password: _, ...userResponse } = user;

      res.status(201).json({
        message: "Account created successfully",
        user: userResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.issues });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login endpoint is now handled in server/index.ts with Passport

  const httpServer = createServer(app);
  return httpServer;
}
