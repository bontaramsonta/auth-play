// -- hono
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
// ---
import env from "@/env";
// --- auth
import { lucia } from "@/lucia";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
// ---
// --- db
import { db } from "@/db";
import { userTable } from "@db/schema";
import { eq } from "drizzle-orm";
// ---

const app = new Hono<{
  Variables: {
    user: {
      id: string;
      email: string;
    };
  };
}>();

app.get("/health", (c) => {
  return c.text(`ok ${new Date().toISOString()}`);
});

app.post("/login", async (c) => {
  //! add zod validation later
  const isTokenBased = c.req.query("token") === "true";
  const body = await c.req.json();
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, body.email));
  if (user.length === 0) {
    return c.text("Invalid email or password", 400);
  }
  // compare password
  const isOk = await new Argon2id().verify(
    user[0].hashed_password,
    body.password
  );
  if (!isOk) {
    return c.text("Invalid email or password", 400);
  }
  const session = await lucia.createSession(user[0].id, {});
  if (isTokenBased) {
    const sessionToken = await sign(session, env.JWT_SHARED_SECRET, "HS256");
    return c.json({ session: sessionToken });
  } else {
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header("Set-Cookie", sessionCookie.serialize());
    return c.redirect("/", 302);
  }
});

app.post("/register", async (c) => {
  //! add zod validation later
  const body = await c.req.json();
  const hashedPassword = await new Argon2id().hash(body.password);
  const userId = generateId(15);
  try {
    await db.insert(userTable).values({
      id: userId,
      email: body.email,
      hashed_password: hashedPassword,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header("Set-Cookie", sessionCookie.serialize());
    c.redirect("/", 302);
  } catch {
    // db error, email taken, etc
    c.text("Email already used", 400);
  }
});

const authMiddleware = createMiddleware(async (c, next) => {
  let sessionId: string | null = null;
  const sessionCookie = getCookie(c, lucia.sessionCookieName);
  if (sessionCookie) {
    sessionId = sessionCookie;
  }
  const tokenHeader = c.req.header("Authorization")?.split(" ");
  const sessionToken = tokenHeader?.[0] === "Bearer" ? tokenHeader?.[1] : null;
  if (sessionToken) {
    const decoded = await verify(sessionToken, env.JWT_SHARED_SECRET, "HS256");
    sessionId = decoded.id;
  }
  if (!sessionId) {
    return new Response(null, {
      status: 401,
    });
  }
  const { session, user } = await lucia.validateSession(sessionId);
  c.set("user", user);
  if (!session) {
    // remove session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    c.header("Set-Cookie", sessionCookie.serialize());
  } else if (session.fresh) {
    // set a fresh session token
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header("Set-Cookie", sessionCookie.serialize());
  }
  await next();
});

app.get("/protected", authMiddleware, async (c) => {
  const user = c.get("user");
  console.log("from protected user", user);
  return c.text("tbd: protected");
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};
