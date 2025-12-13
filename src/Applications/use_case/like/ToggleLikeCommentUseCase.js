class ToggleLikeCommentUseCase {
  constructor({ likeRepository, commentRepository, threadRepository }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    // Verify thread exists
    await this._threadRepository.verifyThreadExists(threadId);

    // Verify comment exists
    await this._commentRepository.verifyCommentExists(commentId);

    // Check if user has already liked the comment
    const isLiked = await this._likeRepository.isLiked(commentId, userId);

    if (isLiked) {
      // Unlike the comment
      await this._likeRepository.removeLike(commentId, userId);
    } else {
      // Like the comment
      await this._likeRepository.addLike(commentId, userId);
    }
  }
}

module.exports = ToggleLikeCommentUseCase;

