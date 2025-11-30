class DeletedComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id } = payload;
    this.id = id;
  }

  _verifyPayload({ id }) {
    if (!id) {
      throw new Error("DELETED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }
    if (typeof id !== "string") {
      throw new Error("DELETED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = DeletedComment;
