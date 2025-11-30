const Reply = require("../Reply");

describe("Reply entity", () => {
  it("should throw error when payload not contain needed property", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "sebuah balasan",
      // owner missing
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError(
      "REPLIES.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      id: 123, // should be string
      content: "sebuah balasan",
      owner: {},
    };

    // Action & Assert
    expect(() => new Reply(payload)).toThrowError(
      "REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create Reply entity correctly", () => {
    // Arrange
    const payload = {
      id: "reply-123",
      content: "sebuah balasan",
      owner: "user-123",
    };

    // Action
    const reply = new Reply(payload);

    // Assert
    expect(reply.id).toEqual(payload.id);
    expect(reply.content).toEqual(payload.content);
    expect(reply.owner).toEqual(payload.owner);
  });
});
