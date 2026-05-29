import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

const DB_URL = `file:${path.join(process.cwd(), "data", "elo.db")}`;

type DB = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { db: DB | undefined };

if (!globalForDb.db) {
  const client = createClient({ url: DB_URL });
  globalForDb.db = drizzle(client, { schema });
}

export const db = globalForDb.db as DB;
