const Thread = require("../Thread"); // sesuaikan path

describe("Thread entity", () => {
  describe("when payload is missing required property", () => {
    it("should throw error THREAD.NOT_CONTAIN_NEEDED_PROPERTY", () => {
      const payloads = [
        {},
        { title: "title" },
        { title: "title", body: "body" },
      ];

      payloads.forEach((payload) => {
        expect(() => new Thread(payload)).toThrow(
          "THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
        );
      });
    });
  });

  describe("when payload has wrong data type", () => {
    it("should throw error THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION", () => {
      const payload = {
        title: 123,
        body: true,
        owner: {},
      };

      expect(() => new Thread(payload)).toThrow(
        "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    });
  });

  describe("when payload is correct", () => {
    it("should create thread instance correctly", () => {
      const payload = {
        title: "Judul Thread",
        body: "Isi thread",
        owner: "user-123",
      };

      const thread = new Thread(payload);

      expect(thread.title).toBe(payload.title);
      expect(thread.body).toBe(payload.body);
      expect(thread.owner).toBe(payload.owner);
    });
  });
});
