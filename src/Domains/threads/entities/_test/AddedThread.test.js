const AddedThread = require("../AddedThread");

describe("AddedThread entity", () => {
  describe("when payload is missing required property", () => {
    it("should throw error ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY", () => {
      const payloads = [
        {},
        { id: "thread-1" },
        { id: "thread-1", title: "Judul" },
      ];

      payloads.forEach((payload) => {
        expect(() => new AddedThread(payload)).toThrow(
          "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
        );
      });
    });
  });

  describe("when payload has wrong data type", () => {
    it("should throw error ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION", () => {
      const payload = {
        id: 123,
        title: true,
        owner: {},
      };

      expect(() => new AddedThread(payload)).toThrow(
        "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });
  });

  describe("when payload is correct", () => {
    it("should create AddedThread instance correctly", () => {
      const payload = {
        id: "thread-123",
        title: "Judul Thread",
        owner: "user-123",
      };

      const addedThread = new AddedThread(payload);

      expect(addedThread.id).toBe(payload.id);
      expect(addedThread.title).toBe(payload.title);
      expect(addedThread.owner).toBe(payload.owner);
    });
  });
});
