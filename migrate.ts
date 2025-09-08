import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from "./shared/schema";
import { config } from "dotenv";

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create the connection
const sqlite = new Database(connectionString.replace('file:', ''));
const db = drizzle(sqlite, { schema });

// Run migrations
async function runMigrations() {
  try {
    console.log("Running database migrations...");

    await migrate(db, { migrationsFolder: "./migrations" });

    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

runMigrations();