const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const Thread = require("../../../../Domains/threads/entities/Thread");
const AddedThread = require("../../../../Domains/threads/entities/AddedThread");
const ThreadsTableTestHelper = require("../../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../../tests/UsersTableTestHelper");

const pool = require("../../../database/postgres/pool");
const NotFoundError = require("../../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../../Commons/exceptions/AuthorizationError");

describe("ThreadRepositoryPostgres", () => {
  beforeEach(async () => {
    // Add user first because threads.owner references users.id
    await UsersTableTestHelper.addUser({ id: "user-123" });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist new thread and return AddedThread correctly", async () => {
      // Arrange
      const newThread = new Thread({
        title: "sebuah thread",
        body: "isi thread",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123"; // fixed id

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert → database terisi
      const threads = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(threads).toHaveLength(1);

      // Assert → return entity
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: "sebuah thread",
          owner: "user-123",
        })
      );
    });
  });

  describe("getThreadById function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => "123"
      );

      await expect(
        threadRepositoryPostgres.getThreadById("thread-x")
      ).rejects.toThrow(NotFoundError);
    });

    it("should return thread correctly when found", async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "judul",
        body: "isi",
        owner: "user-123",
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const thread = await threadRepositoryPostgres.getThreadById("thread-123");

      // Assert
      expect(thread.id).toBe("thread-123");
      expect(thread.title).toBe("judul");
      expect(thread.body).toBe("isi");
      expect(thread.username).toBe("dicoding"); // dari UsersTableTestHelper default username
      expect(thread.date).toBeDefined();
    });
  });

  describe("verifyThreadOwner function", () => {
    it("should throw NotFoundError when thread not found", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => "123"
      );

      await expect(
        threadRepositoryPostgres.verifyThreadOwner("thread-x", "user-123")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError when owner is not match", async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "judul",
        body: "isi",
        owner: "user-123",
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadOwner("thread-123", "user-999")
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw error when owner is correct", async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "judul",
        body: "isi",
        owner: "user-123",
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadOwner("thread-123", "user-123")
      ).resolves.not.toThrow();
    });
  });
});
