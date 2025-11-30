const ThreadsHandler = require("../handler");

describe("ThreadsHandler", () => {
  test("postThreadsHandler should response 201 and added thread", async () => {
    const mockAddedThread = {
      id: "thread-123",
      title: "a title",
      body: "body",
    };

    const mockContainer = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockAddedThread),
      }),
    };

    const handler = new ThreadsHandler(mockContainer);

    const request = {
      payload: { title: "a title", body: "body" },
      auth: { credentials: { id: "user-1" } },
    };

    const h = {
      response: (body) => ({
        ...body,
        code: (status) => status,
      }),
    };

    const response = await handler.postThreadsHandler(request, h);

    expect(response.status).toBe("success");
    expect(response.data.addedThread).toEqual(mockAddedThread);
  });

  test("getThreadDetailHandler should response success with thread", async () => {
    const mockThread = {
      id: "thread-123",
      title: "a title",
      body: "body",
      comments: [],
    };

    const mockContainer = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockThread),
      }),
    };

    const handler = new ThreadsHandler(mockContainer);

    const request = {
      params: { threadId: "thread-123" },
    };

    const h = {
      response: (body) => body,
    };

    const response = await handler.getThreadDetailHandler(request, h);

    expect(response.status).toBe("success");
    expect(response.data.thread).toEqual(mockThread);
  });
});
