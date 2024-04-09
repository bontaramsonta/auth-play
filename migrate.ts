import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "@db/schema";
import env from "@/env";
const connection = new Pool({
  host: env.POSTGRES_HOST,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
  port: env.POSTGRES_PORT,
  max: 1,
});

const db = drizzle(connection, { schema });

export const applyMigrations = async () => {
  await migrate(db, { migrationsFolder: "./migrations" });
  await connection.end();
  console.log("migration applied");
};
applyMigrations();
