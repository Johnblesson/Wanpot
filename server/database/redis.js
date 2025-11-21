import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

const isProduction = process.env.NODE_ENV === "production";

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: isProduction
    ? { tls: true, rejectUnauthorized: false } // Render needs this
    : {} // local development (no TLS)
});

redisClient.on("error", (err) =>
  console.error("❌ Redis Error:", err)
);
redisClient.on("connect", () =>
  console.log("✅ Redis connected successfully")
);

await redisClient.connect();

// Create Redis session store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "wanpot:",
});

// Export session middleware
export const redisSession = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: isProduction, // only true online
    sameSite: "lax",
  },
});

export default redisSession;
