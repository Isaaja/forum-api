const RepliesHandler = require("../handler");

describe("RepliesHandler", () => {
  test("postReplyHandler should response 201 and added reply", async () => {
    const mockAddedReply = { id: "reply-123", content: "a reply" };

    const mockContainer = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockAddedReply),
      }),
    };

    const handler = new RepliesHandler(mockContainer);

    const request = {
      payload: { content: "a reply" },
      params: { threadId: "thread-1", commentId: "comment-1" },
      auth: { credentials: { id: "user-1" } },
    };

    const h = {
      response: (body) => ({
        ...body,
        code: (status) => status,
      }),
    };

    const response = await handler.postReplyHandler(request, h);

    expect(response.status).toBe("success");
    expect(response.data.addedReply).toEqual(mockAddedReply);
  });

  test("deleteReplyHandler should response success", async () => {
    const mockContainer = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(),
      }),
    };

    const handler = new RepliesHandler(mockContainer);

    const request = {
      params: {
        threadId: "thread-1",
        commentId: "comment-1",
        replyId: "reply-1",
      },
      auth: { credentials: { id: "user-1" } },
    };

    const h = {
      response: (body) => body,
    };

    const response = await handler.deleteReplyHandler(request, h);

    expect(response.status).toBe("success");
  });
});
