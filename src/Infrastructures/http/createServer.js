const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const CatboxRedis = require("@hapi/catbox-redis");
const HapiRateLimit = require("hapi-rate-limit");
const ClientError = require("../../Commons/exceptions/ClientError");
const DomainErrorTranslator = require("../../Commons/exceptions/DomainErrorTranslator");
const users = require("../../Interfaces/http/api/users");
const authentications = require("../../Interfaces/http/api/authentications");
const threads = require("../../Interfaces/http/api/threads");
const comments = require("../../Interfaces/http/api/comments");
const replies = require("../../Interfaces/http/api/replies");

const createServer = async (container) => {
  /* istanbul ignore next */
  const isTestEnv = process.env.NODE_ENV === "test";

  // Configure server with Redis cache for rate limiting (production only)
  const serverOptions = {
    host: process.env.HOST,
    port: process.env.PORT,
  };

  // Add Redis cache configuration for production
  /* istanbul ignore next */
  if (!isTestEnv && process.env.REDIS_URL) {
    serverOptions.cache = [
      {
        name: "redis-cache",
        provider: {
          constructor: CatboxRedis,
          options: {
            partition: "rate-limit",
            url: process.env.REDIS_URL,
          },
        },
      },
    ];
  }

  const server = Hapi.server(serverOptions);

  // register external plugin
  const plugins = [
    {
      plugin: Jwt,
    },
  ];

  // Only register rate limit plugin in non-test environment
  /* istanbul ignore next */
  if (!isTestEnv) {
    const rateLimitOptions = {
      enabled: true,
      userLimit: false, // disable default user limit
      pathLimit: false, // disable default path limit (we'll set per-route)
      trustProxy: true, // Trust X-Forwarded-For header from Railway's proxy
      headers: true, // Include rate limit headers in response
    };

    // Use Redis cache if available
    if (process.env.REDIS_URL) {
      rateLimitOptions.pathCache = {
        expiresIn: 60000, // 1 minute
        cache: "redis-cache",
        segment: "hapi-rate-limit-path",
      };
      rateLimitOptions.userCache = {
        expiresIn: 60000,
        cache: "redis-cache",
        segment: "hapi-rate-limit-user",
      };
    }

    plugins.push({
      plugin: HapiRateLimit,
      options: rateLimitOptions,
    });
  }

  await server.register(plugins);

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
