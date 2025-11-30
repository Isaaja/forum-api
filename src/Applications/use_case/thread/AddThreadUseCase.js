const Thread = require("../../../Domains/threads/entities/Thread");

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    // 1. Validate payload using Thread entity
    const thread = new Thread(useCasePayload);

    // 2. Save to repository and get AddedThread
    const addedThread = await this._threadRepository.addThread(thread);

    // 3. Return the result
    return addedThread;
  }
}

module.exports = AddThreadUseCase;
