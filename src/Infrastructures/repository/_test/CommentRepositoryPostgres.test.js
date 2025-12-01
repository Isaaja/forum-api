const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const pool = require("../../database/postgres/pool");

describe("CommentRepositoryPostgres", () => {
  const fakeIdGenerator = () => "123";

  beforeEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    await UsersTableTestHelper.addUser({
      id: "user-123",
      username: "dicoding",
      password: "secret",
      fullname: "Dicoding Academy",
    });

    await ThreadTableTestHelper.addThread({
      id: "thread-123",
      title: "Judul Thread",
      body: "Isi Thread",
      owner: "user-123",
      createdAt: "2025-12-01T07:00:00.000Z",
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // ADD COMMENT
  describe("addComment", () => {
    it("should persist new comment and return AddedComment correctly", async () => {
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const newComment = {
        content: "Isi komentar",
        threadId: "thread-123",
        owner: "user-123",
      };

      const addedComment = await commentRepository.addComment(newComment);

      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);

      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment).toEqual({
        id: "comment-123",
        content: "Isi komentar",
        owner: "user-123",
      });

      expect(comments[0]).toMatchObject({
        id: "comment-123",
        content: "Isi komentar",
        thread_id: "thread-123",
        owner: "user-123",
        is_deleted: false,
      });
    });
  });

  // DELETE COMMENT
  describe("deleteComment", () => {
    it("should soft delete comment correctly", async () => {
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "Isi komentar",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepository.deleteComment("comment-123");

      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toBe(true);
    });
  });

  // GET COMMENTS
  describe("getCommentsByThreadId", () => {
    it("should return comments correctly with all properties", async () => {
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        content: "Komentar pertama",
        threadId: "thread-123",
        owner: "user-123",
        createdAt: "2021-08-08T07:22:33.555Z",
      });

      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        content: "Komentar kedua",
        threadId: "thread-123",
        owner: "user-123",
        createdAt: "2021-08-08T07:26:21.338Z",
      });

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const comments = await commentRepository.getCommentsByThreadId(
        "thread-123"
      );

      expect(comments).toHaveLength(2);

      expect(comments[0]).toEqual({
        id: "comment-123",
        content: "Komentar pertama",
        date: "2021-08-08T07:22:33.555Z",
        username: "dicoding",
        is_deleted: false,
      });

      expect(comments[1]).toEqual({
        id: "comment-456",
        content: "Komentar kedua",
        date: "2021-08-08T07:26:21.338Z",
        username: "dicoding",
        is_deleted: false,
      });
    });
  });

  // VERIFY COMMENT OWNER
  describe("verifyCommentOwner", () => {
    it("should throw NotFoundError when comment not found", async () => {
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await expect(
        commentRepository.verifyCommentOwner("comment-xxx", "user-123")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError when owner is not the comment owner", async () => {
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-999")
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw NotFoundError or AuthorizationError when owner is correct", async () => {
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-123")
      ).resolves.not.toThrow(NotFoundError);

      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-123")
      ).resolves.not.toThrow(AuthorizationError);

      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-123")
      ).resolves.toBeUndefined();
    });
  });

  it("should map raw DB rows to correct output structure", async () => {
    await CommentsTableTestHelper.addComment({
      id: "comment-789",
      content: "Test map",
      threadId: "thread-123",
      owner: "user-123",
      createdAt: "2021-01-01T00:00:00.000Z",
    });

    const commentRepository = new CommentRepositoryPostgres(
      pool,
      fakeIdGenerator
    );

    const comments = await commentRepository.getCommentsByThreadId(
      "thread-123"
    );

    expect(comments[0]).toHaveProperty("id");
    expect(comments[0]).toHaveProperty("content");
    expect(comments[0]).toHaveProperty("date");
    expect(comments[0]).toHaveProperty("username");
    expect(comments[0]).toHaveProperty("is_deleted");
  });

  // VERIFY COMMENT EXISTS
  describe("verifyCommentExists", () => {
    it("should throw NotFoundError when comment not found", async () => {
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await expect(
        commentRepository.verifyCommentExists("comment-xxx")
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw NotFoundError when comment exists", async () => {
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await expect(
        commentRepository.verifyCommentExists("comment-123")
      ).resolves.not.toThrow(NotFoundError);

      await expect(
        commentRepository.verifyCommentExists("comment-123")
      ).resolves.toBeUndefined();
    });
  });
});
