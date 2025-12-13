const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const NotFoundError = require("../../../../Commons/exceptions/NotFoundError");

describe("GetThreadDetailUseCase", () => {
  it("should throw error when thread not found", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new NotFoundError("thread tidak ditemukan")),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(),
    };

    const mockReplyRepository = {
      getRepliesByThreadId: jest.fn(),
    };

    const mockLikeRepository = {
      getLikeCountsByThreadId: jest.fn(),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Act & Assert
    await expect(getThreadDetailUseCase.execute(useCasePayload)).rejects.toThrow(NotFoundError);
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith("thread-123");
    expect(mockCommentRepository.getCommentsByThreadId).not.toHaveBeenCalled();
  });

  it("should return thread detail with comments and replies correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const mockThread = {
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
    };

    const mockComments = [
      {
        id: "comment-123",
        username: "johndoe",
        date: "2021-08-08T07:22:33.555Z",
        content: "sebuah comment",
        is_deleted: false,
      },
      {
        id: "comment-456",
        username: "dicoding",
        date: "2021-08-08T07:26:21.338Z",
        content: "komentar asli",
        is_deleted: true,
      },
    ];

    const mockReplies = [
      {
        id: "reply-123",
        username: "dicoding",
        date: "2021-08-08T07:59:48.766Z",
        content: "balasan asli",
        is_deleted: true,
        comment_id: "comment-123",
      },
      {
        id: "reply-456",
        username: "johndoe",
        date: "2021-08-08T08:07:01.522Z",
        content: "sebuah balasan",
        is_deleted: false,
        comment_id: "comment-123",
      },
    ];

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue(mockThread),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue(mockComments),
    };

    const mockReplyRepository = {
      getRepliesByThreadId: jest.fn().mockResolvedValue(mockReplies),
    };

    const mockLikeRepository = {
      getLikeCountsByThreadId: jest.fn().mockResolvedValue({
        "comment-123": 2,
        "comment-456": 1,
      }),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Act
    const result = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith("thread-123");
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith("thread-123");
    expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith("thread-123");
    expect(mockLikeRepository.getLikeCountsByThreadId).toHaveBeenCalledWith("thread-123");
    expect(result).toEqual({
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
      comments: [
        {
          id: "comment-123",
          username: "johndoe",
          date: "2021-08-08T07:22:33.555Z",
          replies: [
            {
              id: "reply-123",
              content: "**balasan telah dihapus**",
              date: "2021-08-08T07:59:48.766Z",
              username: "dicoding",
            },
            {
              id: "reply-456",
              content: "sebuah balasan",
              date: "2021-08-08T08:07:01.522Z",
              username: "johndoe",
            },
          ],
          content: "sebuah comment",
          likeCount: 2,
        },
        {
          id: "comment-456",
          username: "dicoding",
          date: "2021-08-08T07:26:21.338Z",
          replies: [],
          content: "**komentar telah dihapus**",
          likeCount: 1,
        },
      ],
    });
  });

  it("should return thread detail with empty comments when no comments", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const mockThread = {
      id: "thread-123",
      title: "sebuah thread",
      body: "sebuah body thread",
      date: "2021-08-08T07:19:09.775Z",
      username: "dicoding",
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue(mockThread),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn().mockResolvedValue([]),
    };

    const mockReplyRepository = {
      getRepliesByThreadId: jest.fn().mockResolvedValue([]),
    };

    const mockLikeRepository = {
      getLikeCountsByThreadId: jest.fn().mockResolvedValue({}),
    };

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      likeRepository: mockLikeRepository,
    });

    // Act
    const result = await getThreadDetailUseCase.execute(useCasePayload);

    // Assert
    expect(result.comments).toEqual([]);
  });
});
