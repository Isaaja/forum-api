const AddThreadUseCase = require("../../../../Applications/use_case/thread/AddThreadUseCase");
const GetThreadDetailUseCase = require("../../../../Applications/use_case/thread/GetThreadDetailUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadsHandler = this.postThreadsHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
  }

  async postThreadsHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner,
    });

    const response = h.response({
      status: "success",
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadDetailHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(
      GetThreadDetailUseCase.name
    );
    const { threadId } = request.params;

    const thread = await getThreadDetailUseCase.execute({ threadId });

    return h.response({
      status: "success",
      data: {
        thread,
      },
    });
  }
}

module.exports = ThreadsHandler;
