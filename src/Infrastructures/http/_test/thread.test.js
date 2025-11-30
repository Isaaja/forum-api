const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadRepositoryPostgres = require("../../../Infrastructures/repository/threads/ThreadRepositoryPostgres");
const AddThreadUseCase = require("../../../Applications/use_case/thread/AddThreadUseCase");
const pool = require("../../../Infrastructures/database/postgres/pool");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres & AddThreadUseCase", () => {
  const fakeIdGenerator = () => "123"; // id dummy

  beforeEach(async () => {
    // pastikan ada user untuk foreign key
    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Academy",
    });
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("ThreadRepositoryPostgres", () => {
    it("should persist new thread and return AddedThread correctly", async () => {
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const newThread = {
        title: "Judul Thread",
        body: "Isi thread",
        owner: "user-123",
      };

      const addedThread = await threadRepository.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(threads).toHaveLength(1);
      expect(addedThread.id).toBe("thread-123");
      expect(addedThread.title).toBe(newThread.title);
      expect(addedThread.owner).toBe(newThread.owner);
    });

    it("should throw NotFoundError when thread not found", async () => {
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await expect(threadRepository.getThreadById("thread-x")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw AuthorizationError when owner is incorrect", async () => {
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Judul",
        body: "Isi",
        owner: "user-123",
      });

      await expect(
        threadRepository.verifyThreadOwner("thread-123", "user-999")
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw error when owner is correct", async () => {
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        title: "Judul",
        body: "Isi",
        owner: "user-123",
      });

      await expect(
        threadRepository.verifyThreadOwner("thread-123", "user-123")
      ).resolves.not.toThrow();
    });
  });

  describe("AddThreadUseCase", () => {
    it("should orchestrate the add thread action correctly", async () => {
      const threadRepository = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const addThreadUseCase = new AddThreadUseCase({ threadRepository });

      const useCasePayload = {
        title: "Judul UseCase",
        body: "Isi UseCase",
        owner: "user-123",
      };

      const addedThread = await addThreadUseCase.execute(useCasePayload);

      const threads = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(threads).toHaveLength(1);
      expect(addedThread.id).toBe("thread-123");
      expect(addedThread.title).toBe(useCasePayload.title);
      expect(addedThread.owner).toBe(useCasePayload.owner);
    });
  });
});
