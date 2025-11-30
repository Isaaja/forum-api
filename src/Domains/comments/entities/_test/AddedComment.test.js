const AddedComment = require("../AddedComment");

describe("AddedComment entity", () => {
  describe("when payload is missing required property", () => {
    it("should throw error ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY", () => {
      const payloads = [
        {},
        { id: "comment-123" },
        { id: "comment-123", content: "content" },
        { id: "comment-123", owner: "user-123" },
        { content: "content", owner: "user-123" },
      ];

      payloads.forEach((payload) => {
        expect(() => new AddedComment(payload)).toThrow(
          "ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
      });
    });
  });

  describe("when payload has wrong data type", () => {
    it("should throw error ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION", () => {
      const payloads = [
        { id: 123, content: "content", owner: "user-123" },
        { id: "comment-123", content: 123, owner: "user-123" },
        { id: "comment-123", content: "content", owner: 123 },
        { id: true, content: [], owner: {} },
      ];

      payloads.forEach((payload) => {
        expect(() => new AddedComment(payload)).toThrow(
          "ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
      });
    });
  });

  describe("when payload is correct", () => {
    it("should create AddedComment instance correctly", () => {
      const payload = {
        id: "comment-123",
        content: "Isi komentar",
        owner: "user-123",
      };

      const addedComment = new AddedComment(payload);

      expect(addedComment.id).toBe(payload.id);
      expect(addedComment.content).toBe(payload.content);
      expect(addedComment.owner).toBe(payload.owner);
    });
  });
});
