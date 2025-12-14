const routes = (handler) => [
  {
    method: "POST",
    path: "/threads/{threadId}/comments",
    handler: handler.postCommentHandler,
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
    path: "/threads/{threadId}/comments/{commentId}",
    handler: handler.deleteCommentHandler,
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
    method: "PUT",
    path: "/threads/{threadId}/comments/{commentId}/likes",
    handler: handler.putLikeCommentHandler,
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
