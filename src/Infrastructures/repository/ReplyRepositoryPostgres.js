const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require("../../Domains/replies/entities/AddedReply");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(reply) {
    const { content, commentId, owner } = reply;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies(id, content, comment_id, owner, created_at) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, commentId, owner, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedReply(result.rows[0]);
  }

  async deleteReply(replyId) {
    const query = {
      text: "UPDATE replies SET is_deleted = true WHERE id = $1",
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: "SELECT owner FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("anda tidak berhak mengakses resource ini");
    }
  }

  async verifyReplyExists(replyId) {
    const query = {
      text: "SELECT id FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("balasan tidak ditemukan");
    }
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `
      SELECT 
        replies.id, 
        replies.content, 
        replies.created_at AS date, 
        users.username, 
        replies.is_deleted
      FROM replies
      LEFT JOIN users ON replies.owner = users.id
      WHERE replies.comment_id = $1
      ORDER BY replies.created_at ASC
    `,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      ...row,
      date: row.date.toISOString(),
    }));
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT replies.id, replies.content, replies.created_at as date, users.username, replies.is_deleted, replies.comment_id
             FROM replies
             LEFT JOIN users ON replies.owner = users.id
             LEFT JOIN comments ON replies.comment_id = comments.id
             WHERE comments.thread_id = $1
             ORDER BY replies.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      ...row,
      date: row.date.toISOString(),
    }));
  }
}

module.exports = ReplyRepositoryPostgres;
