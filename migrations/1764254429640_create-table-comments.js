exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("comments", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    content: {
      type: "TEXT",
      notNull: true,
    },
    thread_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"threads"',
      onDelete: "CASCADE",
    },
    owner: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    is_deleted: {
      type: "BOOLEAN",
      notNull: true,
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("comments");
};
