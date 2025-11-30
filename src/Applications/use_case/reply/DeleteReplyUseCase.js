class DeleteReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, replyId, owner } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.getThreadById(threadId);

    // Verify comment exists
    await this._commentRepository.verifyCommentExists(commentId);

    // Verify reply exists and owner is correct
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    // Soft delete reply
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;


