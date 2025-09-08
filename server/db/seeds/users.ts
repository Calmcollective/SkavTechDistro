import { db } from "../../storage";
import { users } from "@shared/schema";
import bcrypt from "bcrypt";

export async function seedUsers() {
  console.log("Seeding users...");

  // Admin user
  const adminPassword = "admin123!@#";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  try {
    await db.insert(users).values({
      username: "admin",
      password: hashedAdminPassword,
      role: "admin",
      email: "admin@skavtech.co.ke",
      firstName: "System",
      lastName: "Administrator",
      phoneNumber: "+254700000000",
      countryCode: "+254",
      city: "Nairobi",
      accountType: "business",
      companyName: "Skavtech Solutions Ltd",
      jobTitle: "System Administrator",
      primaryInterest: "Fleet Management",
      communicationPreferences: ["email"],
      newsletter: false,
      agreeToMarketing: false,
    });
    console.log("✓ Admin user created");
  } catch (error) {
    console.log("Admin user may already exist, skipping...");
  }

  // Regular test users
  const testUsers = [
    {
      username: "testuser1",
      password: await bcrypt.hash("testpass123", 12),
      role: "customer",
      email: "test1@example.com",
      firstName: "Test",
      lastName: "User1",
      phoneNumber: "+254700123456",
      countryCode: "+254",
      city: "Nairobi",
      accountType: "individual",
      primaryInterest: "New Hardware",
      communicationPreferences: ["email", "sms"],
    },
    {
      username: "testuser2",
      password: await bcrypt.hash("testpass123", 12),
      role: "customer",
      email: "test2@example.com",
      firstName: "Test",
      lastName: "User2",
      phoneNumber: "+254700123457",
      countryCode: "+254",
      city: "Mombasa",
      accountType: "business",
      companyName: "Test Company Ltd",
      jobTitle: "IT Manager",
      primaryInterest: "Fleet Management",
      communicationPreferences: ["email", "whatsapp"],
    },
  ];

  for (const userData of testUsers) {
    try {
      await db.insert(users).values(userData);
      console.log(`✓ Test user ${userData.username} created`);
    } catch (error) {
      console.log(`Test user ${userData.username} may already exist, skipping...`);
    }
  }

  console.log("Users seeding completed!");
}