import * as z from "zod";

const envSchema = z.object({
  // --app
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string(),
  JWT_SHARED_SECRET: z.string(),
  // --postgres
  POSTGRES_USER: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number(),
});

// validate the environment variables
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    `Missing or invalid environment variable${
      parsed.error.errors.length > 1 ? "s" : ""
    }:
  ${parsed.error.errors
    .map((error) => `  ${error.path}: ${error.message}`)
    .join("\n")}
  `
  );
  console.log(parsed.error.errors);
  process.exit(1);
}
export const env = Object.freeze(parsed.data);
export default env;
