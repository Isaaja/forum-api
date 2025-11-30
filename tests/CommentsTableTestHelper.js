/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const CommentsTableTestHelper = {
  async addComment({
    id = "comment-123",
    content = "Isi komentar",
    threadId = "thread-123",
    owner = "user-123",
    createdAt = new Date().toISOString(),
    isDeleted = false,
  }) {
    const query = {
      text: "INSERT INTO comments(id, content, thread_id, owner, created_at, is_deleted) VALUES($1, $2, $3, $4, $5, $6)",
      values: [id, content, threadId, owner, createdAt, isDeleted],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM comments WHERE 1=1");
  },
};

module.exports = CommentsTableTestHelper;

