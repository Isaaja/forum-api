class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    // Get thread detail
    const thread = await this._threadRepository.getThreadById(threadId);

    // Get comments for this thread
    const rawComments = await this._commentRepository.getCommentsByThreadId(
      threadId
    );

    // Get all replies for this thread
    const rawReplies = await this._replyRepository.getRepliesByThreadId(
      threadId
    );

    // Map comments - replace content if deleted and add replies
    const comments = rawComments.map((comment) => {
      // Filter replies for this comment
      const commentReplies = rawReplies
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => ({
          id: reply.id,
          content: reply.is_deleted
            ? "**balasan telah dihapus**"
            : reply.content,
          date: reply.date,
          username: reply.username,
        }));

      return {
        id: comment.id,
        username: comment.username,
        date: comment.date,
        replies: commentReplies,
        content: comment.is_deleted
          ? "**komentar telah dihapus**"
          : comment.content,
      };
    });

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
