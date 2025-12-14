const routes = (handler) => [
  {
    method: "POST",
    path: "/threads/{threadId}/comments/{commentId}/replies",
    handler: handler.postReplyHandler,
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
    method: "DELETE",
    path: "/threads/{threadId}/comments/{commentId}/replies/{replyId}",
    handler: handler.deleteReplyHandler,
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
];

module.exports = routes;
