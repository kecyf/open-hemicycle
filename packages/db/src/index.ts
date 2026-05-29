import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

export * from "./schema.ts";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Client Drizzle (singleton). Nécessite DATABASE_URL.
 * Côté serveur uniquement (jamais exposé au client).
 */
export function getDb(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant — voir .env.example");
  }
  if (!_db) {
    const client = postgres(connectionString, { prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
}
