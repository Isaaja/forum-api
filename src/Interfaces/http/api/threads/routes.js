const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: handler.postThreadsHandler,
    options: {
      auth: "forumapi_jwt",
      plugins: {
        "hapi-rate-limit": {
          pathLimit: 90, // 90 requests
          pathCache: {
            expiresIn: 60000, // per 1 minute (60000 ms)
          },
        },
      },
    },
  },
  {
    method: "GET",
    path: "/threads/{threadId}",
    handler: handler.getThreadDetailHandler,
    options: {
      plugins: {
        "hapi-rate-limit": {
          pathLimit: 90, // 90 requests
          pathCache: {
            expiresIn: 60000, // per 1 minute (60000 ms)
          },
        },
      },
    },
  },
];

module.exports = routes;
