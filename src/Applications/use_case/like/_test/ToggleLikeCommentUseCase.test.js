const ToggleLikeCommentUseCase = require("../ToggleLikeCommentUseCase");
const LikeRepository = require("../../../../Domains/likes/LikeRepository");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");

describe("ToggleLikeCommentUseCase", () => {
  it("should orchestrate the add like action correctly when not liked", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockLikeRepository.isLiked = jest.fn(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
    expect(mockLikeRepository.isLiked).toBeCalledWith("comment-123", "user-123");
    expect(mockLikeRepository.addLike).toBeCalledWith("comment-123", "user-123");
    expect(mockLikeRepository.removeLike).not.toBeCalled();
  });

  it("should orchestrate the remove like action correctly when already liked", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadExists = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentExists = jest.fn(() => Promise.resolve());
    mockLikeRepository.isLiked = jest.fn(() => Promise.resolve(true));
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve());
    mockLikeRepository.removeLike = jest.fn(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists).toBeCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith("comment-123");
    expect(mockLikeRepository.isLiked).toBeCalledWith("comment-123", "user-123");
    expect(mockLikeRepository.removeLike).toBeCalledWith("comment-123", "user-123");
    expect(mockLikeRepository.addLike).not.toBeCalled();
  });
});

