exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("threads", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    title: {
      type: "TEXT",
      notNull: true,
    },
    body: {
      type: "TEXT",
      notNull: true,
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
  });
};

exports.down = (pgm) => {
  pgm.dropTable("threads");
};
