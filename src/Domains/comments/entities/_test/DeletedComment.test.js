const DeletedComment = require("../DeletedComment");

describe("DeletedComment", () => {
  describe("Constructor", () => {
    it("should create DeletedComment instance correctly when given valid payload", () => {
      // Arrange
      const payload = {
        id: "comment-123",
      };

      // Action
      const deletedComment = new DeletedComment(payload);

      // Assert
      expect(deletedComment.id).toEqual(payload.id);
    });

    it("should throw error when payload does not contain needed properties", () => {
      // Arrange
      const invalidPayloads = [
        {}, // empty payload
        { id: "" }, // empty id
        { id: null }, // id as null
        { id: undefined }, // id as undefined
      ];

      // Action & Assert
      invalidPayloads.forEach((payload) => {
        expect(() => new DeletedComment(payload)).toThrowError(
          "DELETED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
      });
    });

    it("should throw error when payload properties do not meet data type specification", () => {
      // Arrange
      const invalidPayloads = [
        { id: 123 }, // id as number
        { id: {} }, // id as object
        { id: [] }, // id as array
        { id: true }, // id as boolean
      ];

      // Action & Assert
      invalidPayloads.forEach((payload) => {
        expect(() => new DeletedComment(payload)).toThrowError(
          "DELETED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
        );
      });
    });

    it("should throw NOT_CONTAIN_NEEDED_PROPERTY for falsy values that are not strings", () => {
      // Arrange
      const invalidPayloads = [
        { id: 0 }, // id as zero (falsy)
        { id: false }, // id as false (falsy)
        { id: NaN }, // id as NaN (falsy)
      ];

      // Action & Assert
      invalidPayloads.forEach((payload) => {
        expect(() => new DeletedComment(payload)).toThrowError(
          "DELETED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
        );
      });
    });
  });

  describe("Instance Properties", () => {
    it("should have correct property types after instantiation", () => {
      // Arrange
      const payload = {
        id: "comment-123",
      };

      // Action
      const deletedComment = new DeletedComment(payload);

      // Assert
      expect(typeof deletedComment.id).toBe("string");
    });

    it("should assign properties with correct values", () => {
      // Arrange
      const payload = {
        id: "comment-456",
      };

      // Action
      const deletedComment = new DeletedComment(payload);

      // Assert
      expect(deletedComment.id).toBe("comment-456");
    });

    it("should handle different valid id formats", () => {
      // Arrange
      const payloads = [
        { id: "comment-123" },
        { id: "comment-abc" },
        { id: "comment-123-abc" },
        { id: "comment_123" },
      ];

      // Action & Assert
      payloads.forEach((payload) => {
        expect(() => new DeletedComment(payload)).not.toThrow();
        const deletedComment = new DeletedComment(payload);
        expect(deletedComment.id).toBe(payload.id);
      });
    });
  });
});
