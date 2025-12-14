const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const {
  RateLimiterRedis,
  RateLimiterMemory,
} = require("rate-limiter-flexible");
const Redis = require("ioredis");
const ClientError = require("../../Commons/exceptions/ClientError");
const DomainErrorTranslator = require("../../Commons/exceptions/DomainErrorTranslator");
const users = require("../../Interfaces/http/api/users");
const authentications = require("../../Interfaces/http/api/authentications");
const threads = require("../../Interfaces/http/api/threads");
const comments = require("../../Interfaces/http/api/comments");
const replies = require("../../Interfaces/http/api/replies");

// Rate limiter configuration
const RATE_LIMIT_POINTS = 90; // 90 requests
const RATE_LIMIT_DURATION = 60; // per 60 seconds (1 minute)

/* istanbul ignore next */
const createRateLimiter = () => {
  // Use Redis if REDIS_URL is available (works in any environment)
  if (process.env.REDIS_URL) {
    try {
      const redisClient = new Redis(process.env.REDIS_URL, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3,
        connectTimeout: 10000,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
      });

      redisClient.on("error", (err) => {
        console.error("Redis error:", err.message);
      });

      redisClient.on("connect", () => {
        console.log("Redis connected successfully");
      });

      return new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: "rate-limit-threads",
        points: RATE_LIMIT_POINTS,
        duration: RATE_LIMIT_DURATION,
        blockDuration: 0,
        insuranceLimiter: new RateLimiterMemory({
          points: RATE_LIMIT_POINTS,
          duration: RATE_LIMIT_DURATION,
        }),
      });
    } catch (err) {
      console.error(
        "Redis initialization failed, using in-memory:",
        err.message
      );
    }
  }

  // Fallback to in-memory rate limiter
  console.log("Using in-memory rate limiter (no REDIS_URL provided)");
  return new RateLimiterMemory({
    points: RATE_LIMIT_POINTS,
    duration: RATE_LIMIT_DURATION,
  });
};

const createServer = async (container) => {
  /* istanbul ignore next */
  const isTestEnv = process.env.NODE_ENV === "test";

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
  });

  // Create rate limiter (Redis or Memory based on environment)
  /* istanbul ignore next */
  const rateLimiter = isTestEnv ? null : createRateLimiter();
  /* istanbul ignore next */
  if (rateLimiter) {
    console.log(
      `Rate limiter initialized: ${
        process.env.REDIS_URL ? "Redis (with in-memory fallback)" : "In-Memory"
      }`
    );
    console.log(
      `Rate limit: ${RATE_LIMIT_POINTS} requests per ${RATE_LIMIT_DURATION} seconds`
    );
  }

  // register external plugin
  const plugins = [
    {
      plugin: Jwt,
    },
  ];

  await server.register(plugins);

  // Rate limiting middleware for /threads endpoints (using onRequest for earliest interception)
  /* istanbul ignore next */
  if (rateLimiter) {
    server.ext("onRequest", async (request, h) => {
      // Only apply rate limiting to paths starting with /threads
      // This includes: /threads, /threads/{id}, /threads/{id}/comments, etc.
      const path = request.path;
      if (path !== "/threads" && !path.startsWith("/threads/")) {
        return h.continue;
      }

      // Get client IP (support for reverse proxy like Railway)
      const forwardedFor = request.headers["x-forwarded-for"];
      const clientIp = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : request.info.remoteAddress;

      try {
        const rateLimitRes = await rateLimiter.consume(clientIp);
        // Add rate limit headers to successful requests
        request.headers["x-ratelimit-limit"] = RATE_LIMIT_POINTS;
        request.headers["x-ratelimit-remaining"] = rateLimitRes.remainingPoints;
        return h.continue;
      } catch (rejRes) {
        // Rate limit exceeded
        console.log(`Rate limit exceeded for IP: ${clientIp}`);
        const response = h.response({
          status: "fail",
          message: "Too many requests. Please try again later.",
        });
        response.code(429);

        // Add rate limit headers
        const retryAfter = Math.ceil((rejRes.msBeforeNext || 60000) / 1000);
        response.header("Retry-After", retryAfter);
        response.header("X-RateLimit-Limit", RATE_LIMIT_POINTS);
        response.header("X-RateLimit-Remaining", 0);
        response.header(
          "X-RateLimit-Reset",
          new Date(Date.now() + (rejRes.msBeforeNext || 60000)).toISOString()
        );

        return response.takeover();
      }
    });
  }

  // define jwt authentication strategy
  server.auth.strategy("forumapi_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // register semua plugin
  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    },
    {
      plugin: replies,
      options: { container },
    },
  ]);

  // penanganan error global
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      const translatedError = DomainErrorTranslator.translate(response);

      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      if (!translatedError.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  return server;
};

module.exports = createServer;
