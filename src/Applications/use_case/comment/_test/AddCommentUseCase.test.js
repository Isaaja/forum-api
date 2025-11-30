const AddCommentUseCase = require("../../../use_case/comment/AddCommentUseCase");
const AddedComment = require("../../../../Domains/comments/entities/AddedComment");
const Comment = require("../../../../Domains/comments/entities/Comment");
const NotFoundError = require("../../../../Commons/exceptions/NotFoundError");

describe("AddCommentUseCase", () => {
  it("should throw error when thread not found", async () => {
    // Arrange
    const useCasePayload = {
      content: "Isi komentar",
      threadId: "thread-123",
      owner: "user-123",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new NotFoundError("thread tidak ditemukan")),
    };

    const mockCommentRepository = {
      addComment: jest.fn(),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act & Assert
    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith("thread-123");
    expect(mockCommentRepository.addComment).not.toHaveBeenCalled();
  });

  it("should orchestrate the add comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "Isi komentar",
      threadId: "thread-123",
      owner: "user-123",
    };

    const expectedAddedComment = new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({
        id: "thread-123",
        title: "Judul Thread",
        body: "Isi thread",
        owner: "user-123",
      }),
    };

    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue(expectedAddedComment),
    };

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(result).toEqual(expectedAddedComment);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith("thread-123");
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      new Comment(useCasePayload)
    );
  });
});

