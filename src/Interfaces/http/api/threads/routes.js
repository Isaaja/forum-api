const routes = (handler) => [
  {
    method: "POST",
    path: "/threads",
    handler: handler.postThreadsHandler,
    options: {
      auth: "forumapi_jwt",
    },
  },
  {
    method: "GET",
    path: "/threads/{threadId}",
    handler: handler.getThreadDetailHandler,
  },
];

module.exports = routes;
