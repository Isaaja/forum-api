const AddThreadUseCase = require("../AddThreadUseCase");
const AddedThread = require("../../../../Domains/threads/entities/AddedThread");
const Thread = require("../../../../Domains/threads/entities/Thread");

describe("AddThreadUseCase", () => {
  it("should orchestrate the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "Judul Thread",
      body: "Isi thread",
      owner: "user-123",
    };

    const mockThreadRepository = {
      addThread: jest.fn().mockResolvedValue(
        new AddedThread({
          id: "thread-123",
          title: useCasePayload.title,
          owner: useCasePayload.owner,
        })
      ),
    };

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Act
    const result = await addThreadUseCase.execute(useCasePayload);

    const expected = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    // Assert
    expect(result).toStrictEqual(expected);
    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      new Thread(useCasePayload)
    );
  });
});
