const AddCommentUseCase = require("../../../../Applications/use_case/comment/AddCommentUseCase");
const DeleteCommentUseCase = require("../../../../Applications/use_case/comment/DeleteCommentUseCase");
const ToggleLikeCommentUseCase = require("../../../../Applications/use_case/like/ToggleLikeCommentUseCase");

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.putLikeCommentHandler = this.putLikeCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(
      AddCommentUseCase.name
    );
    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;

    const addedComment = await addCommentUseCase.execute({
      ...request.payload,
      threadId,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name
    );
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute({
      threadId,
      commentId,
      owner,
    });

    return h.response({
      status: "success",
    });
  }

  async putLikeCommentHandler(request, h) {
    const toggleLikeCommentUseCase = this._container.getInstance(
      ToggleLikeCommentUseCase.name
    );
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await toggleLikeCommentUseCase.execute({
      threadId,
      commentId,
      userId,
    });

    return h.response({
      status: "success",
    });
  }
}

module.exports = CommentsHandler;
