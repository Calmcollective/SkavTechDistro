import { storage } from "../../storage";
import type { InsertProduct } from "@shared/schema";

export const seedProducts = async () => {
  const products: InsertProduct[] = [
    {
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
    },
    {
      name: "Lenovo ThinkPad T14",
      brand: "Lenovo",
      category: "laptops",
      condition: "new",
      price: 1299,
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
    },
    {
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
    },
    {
      name: "Apple MacBook Pro 14\"",
      brand: "Apple",
      category: "laptops",
      condition: "new",
      price: 1999,
      description: "Professional laptop with M2 chip, 16GB RAM, and 512GB SSD",
      specifications: {
        processor: "Apple M2",
        ram: "16GB",
        storage: "512GB SSD",
        screen: "14.2-inch Liquid Retina XDR"
      },
      warrantyYears: 1,
      stockQuantity: 6,
      imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    },
    {
      name: "Dell PowerEdge R450",
      brand: "Dell",
      category: "servers",
      condition: "refurbished",
      price: 2899,
      originalPrice: 4200,
      description: "Mid-range server with single Xeon processor and 32GB RAM",
      specifications: {
        processor: "Intel Xeon",
        ram: "32GB",
        storage: "1TB SSD",
        ports: "USB, Ethernet, VGA"
      },
      warrantyYears: 2,
      stockQuantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    },
    {
      name: "ASUS ROG Strix G15",
      brand: "ASUS",
      category: "laptops",
      condition: "new",
      price: 1499,
      description: "Gaming laptop with AMD Ryzen 7, 16GB RAM, and RTX 3060",
      specifications: {
        processor: "AMD Ryzen 7",
        ram: "16GB",
        storage: "512GB SSD",
        graphics: "NVIDIA RTX 3060",
        screen: "15.6-inch Full HD 144Hz"
      },
      warrantyYears: 2,
      stockQuantity: 4,
      imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    },
    {
      name: "HP EliteBook 840 G8",
      brand: "HP",
      category: "laptops",
      condition: "refurbished",
      price: 899,
      originalPrice: 1299,
      description: "Business laptop with Intel i5, 16GB RAM, and 256GB SSD",
      specifications: {
        processor: "Intel i5",
        ram: "16GB",
        storage: "256GB SSD",
        screen: "14-inch Full HD"
      },
      warrantyYears: 1,
      stockQuantity: 7,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    },
    {
      name: "Lenovo ThinkCentre M70q",
      brand: "Lenovo",
      category: "desktops",
      condition: "new",
      price: 699,
      description: "Compact business desktop with Intel i5 and 16GB RAM",
      specifications: {
        processor: "Intel i5",
        ram: "16GB",
        storage: "512GB SSD",
        ports: "USB-C, USB, HDMI"
      },
      warrantyYears: 3,
      stockQuantity: 9,
      imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    },
    {
      name: "Cisco UCS C240 M5",
      brand: "Cisco",
      category: "servers",
      condition: "refurbished",
      price: 3499,
      originalPrice: 5200,
      description: "Enterprise server with dual Xeon processors and 64GB RAM",
      specifications: {
        processor: "Dual Intel Xeon",
        ram: "64GB",
        storage: "2x 1TB SSD",
        ports: "Multiple Ethernet, USB"
      },
      warrantyYears: 2,
      stockQuantity: 2,
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    },
    {
      name: "Dell Inspiron 15 3000",
      brand: "Dell",
      category: "laptops",
      condition: "new",
      price: 599,
      description: "Budget laptop with Intel i3, 8GB RAM, and 256GB SSD",
      specifications: {
        processor: "Intel i3",
        ram: "8GB",
        storage: "256GB SSD",
        screen: "15.6-inch HD"
      },
      warrantyYears: 1,
      stockQuantity: 15,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      isActive: true,
    }
  ];

  console.log("Seeding products...");
  for (const product of products) {
    try {
      await storage.createProduct(product);
      console.log(`✓ Created product: ${product.name}`);
    } catch (error) {
      console.error(`✗ Failed to create product: ${product.name}`, error);
    }
  }
  console.log("Product seeding completed!");
};