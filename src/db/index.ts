import { createClient } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";

const url = process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), "data", "elo.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

type DB = LibSQLDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { db: DB | undefined };

if (!globalForDb.db) {
  const client = createClient({ url, authToken });
  globalForDb.db = drizzle(client, { schema });
}

export const db = globalForDb.db as DB;
