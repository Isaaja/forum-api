const LikeRepositoryPostgres = require("../LikeRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");

describe("LikeRepositoryPostgres", () => {
  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addLike function", () => {
    it("should add like to database", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      await likeRepositoryPostgres.addLike("comment-123", "user-123");

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentId(
        "comment-123"
      );
      expect(likes).toHaveLength(1);
    });
  });

  describe("removeLike function", () => {
    it("should remove like from database", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await LikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        userId: "user-123",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      await likeRepositoryPostgres.removeLike("comment-123", "user-123");

      // Assert
      const likes = await LikesTableTestHelper.findLikesByCommentId(
        "comment-123"
      );
      expect(likes).toHaveLength(0);
    });
  });

  describe("isLiked function", () => {
    it("should return true if user has liked the comment", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await LikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        userId: "user-123",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const isLiked = await likeRepositoryPostgres.isLiked(
        "comment-123",
        "user-123"
      );

      // Assert
      expect(isLiked).toBe(true);
    });

    it("should return false if user has not liked the comment", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const isLiked = await likeRepositoryPostgres.isLiked(
        "comment-123",
        "user-123"
      );

      // Assert
      expect(isLiked).toBe(false);
    });
  });

  describe("getLikeCountByCommentId function", () => {
    it("should return correct like count", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await UsersTableTestHelper.addUser({ id: "user-456", username: "user2" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await LikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        userId: "user-123",
      });
      await LikesTableTestHelper.addLike({
        id: "like-456",
        commentId: "comment-123",
        userId: "user-456",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId(
        "comment-123"
      );

      // Assert
      expect(likeCount).toBe(2);
    });

    it("should return 0 if no likes", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const likeCount = await likeRepositoryPostgres.getLikeCountByCommentId(
        "comment-123"
      );

      // Assert
      expect(likeCount).toBe(0);
    });
  });

  describe("getLikeCountsByThreadId function", () => {
    it("should return like counts for all comments in thread", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await UsersTableTestHelper.addUser({ id: "user-456", username: "user2" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });
      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        threadId: "thread-123",
        owner: "user-123",
      });
      await LikesTableTestHelper.addLike({
        id: "like-123",
        commentId: "comment-123",
        userId: "user-123",
      });
      await LikesTableTestHelper.addLike({
        id: "like-456",
        commentId: "comment-123",
        userId: "user-456",
      });
      await LikesTableTestHelper.addLike({
        id: "like-789",
        commentId: "comment-456",
        userId: "user-123",
      });

      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        () => "123"
      );

      // Action
      const likeCounts = await likeRepositoryPostgres.getLikeCountsByThreadId(
        "thread-123"
      );

      // Assert
      expect(likeCounts["comment-123"]).toBe(2);
      expect(likeCounts["comment-456"]).toBe(1);
    });
  });
});
