class ThreadRepository {
  async addThread(thread) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyThreadOwner(threadId, owner) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyThreadExists(threadId) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getThreadById(threadId) {
    throw new Error("THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = ThreadRepository;
