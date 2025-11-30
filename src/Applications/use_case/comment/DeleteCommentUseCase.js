class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.getThreadById(threadId);

    // Verify comment exists and owner is correct
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // Soft delete comment
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
