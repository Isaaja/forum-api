const LikeRepository = require("../../Domains/likes/LikeRepository");

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: "INSERT INTO comment_likes(id, comment_id, user_id) VALUES($1, $2, $3)",
      values: [id, commentId, userId],
    };

    await this._pool.query(query);
  }

  async removeLike(commentId, userId) {
    const query = {
      text: "DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async isLiked(commentId, userId) {
    const query = {
      text: "SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2",
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: "SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0].count, 10);
  }

  async getLikeCountsByThreadId(threadId) {
    const query = {
      text: `
        SELECT comments.id as comment_id, COUNT(comment_likes.id) as like_count
        FROM comments
        LEFT JOIN comment_likes ON comments.id = comment_likes.comment_id
        WHERE comments.thread_id = $1
        GROUP BY comments.id
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    
    // Return as a Map/Object for easy lookup
    const likeCounts = {};
    result.rows.forEach((row) => {
      likeCounts[row.comment_id] = parseInt(row.like_count, 10);
    });
    
    return likeCounts;
  }
}

module.exports = LikeRepositoryPostgres;

