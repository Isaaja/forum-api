const Comment = require("../Comment");

describe("Comment entity", () => {
  describe("when payload is missing required property", () => {
    it("should throw error COMMENT.NOT_CONTAIN_NEEDED_PROPERTY", () => {
      const payloads = [
        {},
        { content: "content" },
        { content: "content", threadId: "thread-123" },
        { content: "content", owner: "user-123" },
        { threadId: "thread-123", owner: "user-123" },
      ];

      payloads.forEach((payload) => {
        expect(() => new Comment(payload)).toThrow(
          "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
      });
    });
  });

  describe("when payload has wrong data type", () => {
    it("should throw error COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION", () => {
      const payloads = [
        { content: 123, threadId: "thread-123", owner: "user-123" },
        { content: "content", threadId: 123, owner: "user-123" },
        { content: "content", threadId: "thread-123", owner: 123 },
        { content: true, threadId: [], owner: {} },
      ];

      payloads.forEach((payload) => {
        expect(() => new Comment(payload)).toThrow(
          "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
      });
    });
  });

  describe("when payload is correct", () => {
    it("should create Comment instance correctly", () => {
      const payload = {
        content: "Isi komentar",
        threadId: "thread-123",
        owner: "user-123",
      };

      const comment = new Comment(payload);

      expect(comment.content).toBe(payload.content);
      expect(comment.threadId).toBe(payload.threadId);
      expect(comment.owner).toBe(payload.owner);
    });
  });
});
