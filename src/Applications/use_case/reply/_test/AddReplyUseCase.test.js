const AddReplyUseCase = require("../AddReplyUseCase");
const NewReply = require("../../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");

describe("AddReplyUseCase", () => {
  it("should orchestrating the add reply action correctly", async () => {
    // Arrange
    const useCasePayload = {
      content: "sebuah balasan",
      commentId: "comment-123",
      threadId: "thread-123",
      owner: "user-123",
    };

    const mockAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:59:16.198Z",
        username: "dicoding",
      })
    );
    mockCommentRepository.verifyCommentExists = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: "reply-123",
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      })
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith(
      useCasePayload.threadId
    );
    expect(mockCommentRepository.verifyCommentExists).toBeCalledWith(
      useCasePayload.commentId
    );
    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply({
        content: useCasePayload.content,
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      })
    );
  });
});

