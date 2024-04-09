import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import env from "@/env";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@db/schema";

const pool = new Pool({
  host: env.POSTGRES_HOST,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: env.POSTGRES_PORT,
  min: 5,
});

export const db = drizzle(pool);

export const dbAdapter = new DrizzlePostgreSQLAdapter(
  db,
  schema.sessionTable,
  schema.userTable
);
