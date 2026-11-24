
import dotenv from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Load environment variables from Vercel's local environment file
dotenv.config({ path: ".env.local" });

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Check your .env.local file."
  );
}

// Neon PostgreSQL connection
export const pool = new Pool({
  connectionString: databaseUrl,
});

// Drizzle ORM instance
export const db = drizzle({
  client: pool,
  schema,
});
