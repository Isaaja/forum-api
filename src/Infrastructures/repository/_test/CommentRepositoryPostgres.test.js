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
    // Clean up first to avoid duplicate key errors
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

  describe("addComment", () => {
    it("should persist new comment and return AddedComment correctly", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const newComment = {
        content: "Isi komentar",
        threadId: "thread-123",
        owner: "user-123",
      };

      // Action
      const addedComment = await commentRepository.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);
      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment.id).toBe("comment-123");
      expect(addedComment.content).toBe(newComment.content);
      expect(addedComment.owner).toBe(newComment.owner);
    });
  });

  describe("deleteComment", () => {
    it("should soft delete comment correctly", async () => {
      // Arrange
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

      // Action
      await commentRepository.deleteComment("comment-123");

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_deleted).toBe(true);
    });
  });

  describe("getCommentsByThreadId", () => {
    it("should return comments correctly", async () => {
      // Arrange
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

      // Action
      const comments = await commentRepository.getCommentsByThreadId(
        "thread-123"
      );

      // Assert
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toBe("comment-123");
      expect(comments[1].id).toBe("comment-456");
    });
  });

  describe("verifyCommentOwner", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner("comment-xxx", "user-123")
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw AuthorizationError when owner is not the comment owner", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-999")
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw error when owner is correct", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentOwner("comment-123", "user-123")
      ).resolves.not.toThrow();
    });
  });

  describe("verifyCommentExists", () => {
    it("should throw NotFoundError when comment not found", async () => {
      // Arrange
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentExists("comment-xxx")
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw error when comment exists", async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      const commentRepository = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepository.verifyCommentExists("comment-123")
      ).resolves.not.toThrow();
    });
  });
});
