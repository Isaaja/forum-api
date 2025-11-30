const CommentsHandler = require("../handler");

describe("CommentsHandler", () => {
  test("postCommentHandler should response 201 and added comment", async () => {
    const mockAddedComment = { id: "comment-123", content: "a comment" };

    const mockContainer = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(mockAddedComment),
      }),
    };

    const handler = new CommentsHandler(mockContainer);

    const request = {
      payload: { content: "a comment" },
      params: { threadId: "thread-1" },
      auth: { credentials: { id: "user-1" } },
    };

    const h = {
      response: (body) => ({
        ...body,
        code: (status) => status,
      }),
    };

    const response = await handler.postCommentHandler(request, h);

    expect(response.status).toBe("success");
    expect(response.data.addedComment).toEqual(mockAddedComment);
  });

  test("deleteCommentHandler should response success", async () => {
    const mockContainer = {
      getInstance: jest.fn().mockReturnValue({
        execute: jest.fn().mockResolvedValue(),
      }),
    };

    const handler = new CommentsHandler(mockContainer);

    const request = {
      params: { threadId: "thread-1", commentId: "comment-1" },
      auth: { credentials: { id: "user-1" } },
    };

    const h = {
      response: (body) => body,
    };

    const response = await handler.deleteCommentHandler(request, h);

    expect(response.status).toBe("success");
  });
});
