import { Lucia } from "lucia";
import { dbAdapter } from "@/db";
import env from "@/env";

export const lucia = new Lucia(dbAdapter, {
  sessionCookie: {
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
    };
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
    };
  }
}
