import env from "@/env";
import type { Config } from "drizzle-kit";
export default {
  schema: "./db/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    port: env.POSTGRES_PORT,
  },
} satisfies Config;
