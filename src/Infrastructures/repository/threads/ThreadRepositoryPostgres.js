const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads(id, title, body, owner, created_at) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, owner, createdAt],
    };

    const result = await this._pool.query(query);

    return new AddedThread(result.rows[0]);
  }

  async getThreadById(id) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.created_at as date, users.username
             FROM threads
             LEFT JOIN users ON threads.owner = users.id
             WHERE threads.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    return result.rows[0];
  }

  async verifyThreadOwner(id, owner) {
    const query = {
      text: "SELECT owner FROM threads WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread tidak ditemukan");
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError("anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = ThreadRepositoryPostgres;
