const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addReply function", () => {
    it("should persist new reply and return added reply correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });

      const newReply = {
        content: "sebuah balasan",
        commentId: "comment-123",
        owner: "user-123",
      };

      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById("reply-123");
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: "sebuah balasan",
          owner: "user-123",
        })
      );
    });
  });

  describe("deleteReply function", () => {
    it("should soft delete reply from database", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
      await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply("reply-123");

      // Assert
      const replies = await RepliesTableTestHelper.findRepliesById("reply-123");
      expect(replies[0].is_deleted).toEqual(true);
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when owner is not the reply owner", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
      await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-456")
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw error when owner is the reply owner", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
      await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner("reply-123", "user-123")
      ).resolves.not.toThrowError();
    });
  });

  describe("verifyReplyExists function", () => {
    it("should throw NotFoundError when reply not found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists("reply-123")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should not throw error when reply exists", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
      await RepliesTableTestHelper.addReply({ id: "reply-123", commentId: "comment-123", owner: "user-123" });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(
        replyRepositoryPostgres.verifyReplyExists("reply-123")
      ).resolves.not.toThrowError();
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return empty array when no replies found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId("comment-123");

      // Assert
      expect(replies).toEqual([]);
    });

    it("should return replies correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
        content: "sebuah balasan",
        date: "2021-08-08T07:59:48.766Z",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByCommentId("comment-123");

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual("reply-123");
      expect(replies[0].username).toEqual("dicoding");
      expect(replies[0].content).toEqual("sebuah balasan");
      expect(replies[0].is_deleted).toEqual(false);
    });
  });

  describe("getRepliesByThreadId function", () => {
    it("should return empty array when no replies found", async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId("thread-123");

      // Assert
      expect(replies).toEqual([]);
    });

    it("should return replies correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123", username: "dicoding" });
      await ThreadTableTestHelper.addThread({ id: "thread-123", owner: "user-123" });
      await CommentsTableTestHelper.addComment({ id: "comment-123", threadId: "thread-123", owner: "user-123" });
      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        commentId: "comment-123",
        owner: "user-123",
        content: "sebuah balasan",
        date: "2021-08-08T07:59:48.766Z",
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId("thread-123");

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual("reply-123");
      expect(replies[0].username).toEqual("dicoding");
      expect(replies[0].content).toEqual("sebuah balasan");
      expect(replies[0].comment_id).toEqual("comment-123");
      expect(replies[0].is_deleted).toEqual(false);
    });
  });
});

