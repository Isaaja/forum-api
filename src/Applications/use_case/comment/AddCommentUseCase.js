const Comment = require("../../../Domains/comments/entities/Comment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { content, threadId, owner } = useCasePayload;

    // Verify thread exists (will throw NotFoundError if not found)
    await this._threadRepository.getThreadById(threadId);

    // Validate payload using Comment entity
    const comment = new Comment({ content, threadId, owner });

    // Save to repository and return AddedComment
    return this._commentRepository.addComment(comment);
  }
}

module.exports = AddCommentUseCase;
