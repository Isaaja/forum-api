const NewReply = require("../../../Domains/replies/entities/NewReply");

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, commentId, threadId, owner } = useCasePayload;

    // Verify thread exists (will throw NotFoundError if not found)
    await this._threadRepository.getThreadById(threadId);

    // Verify comment exists (will throw NotFoundError if not found)
    await this._commentRepository.verifyCommentExists(commentId);

    // Validate payload using NewReply entity
    const newReply = new NewReply({ content, commentId, owner });

    // Save to repository and return AddedReply
    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;


