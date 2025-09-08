import { config } from "dotenv";

// Load environment variables FIRST
config();

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

import { seedProducts } from "./server/db/seeds/products";
import { seedUsers } from "./server/db/seeds/users";

async function main() {
  try {
    console.log("Starting database seeding...");
    await seedUsers();
    await seedProducts();
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();