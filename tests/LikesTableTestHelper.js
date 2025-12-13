/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const LikesTableTestHelper = {
  async addLike({
    id = "like-123",
    commentId = "comment-123",
    userId = "user-123",
  }) {
    const query = {
      text: "INSERT INTO comment_likes(id, comment_id, user_id) VALUES($1, $2, $3)",
      values: [id, commentId, userId],
    };

    await pool.query(query);
  },

  async findLikesByCommentId(commentId) {
    const query = {
      text: "SELECT * FROM comment_likes WHERE comment_id = $1",
      values: [commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM comment_likes WHERE 1=1");
  },
};

module.exports = LikesTableTestHelper;

