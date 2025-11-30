const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const NotFoundError = require("../../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../../Commons/exceptions/AuthorizationError");

describe("DeleteCommentUseCase", () => {
  it("should throw error when thread not found", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new NotFoundError("thread tidak ditemukan")),
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn(),
      deleteComment: jest.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });

  it("should throw error when comment not found", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({ id: "thread-123" }),
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockRejectedValue(new NotFoundError("komentar tidak ditemukan")),
      deleteComment: jest.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrow(NotFoundError);
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });

  it("should throw error when user is not the comment owner", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-456",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({ id: "thread-123" }),
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockRejectedValue(new AuthorizationError("anda tidak berhak mengakses resource ini")),
      deleteComment: jest.fn(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrow(AuthorizationError);
    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });

  it("should orchestrate the delete comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      owner: "user-123",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({ id: "thread-123" }),
    };

    const mockCommentRepository = {
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith("thread-123");
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith("comment-123", "user-123");
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith("comment-123");
  });
});

