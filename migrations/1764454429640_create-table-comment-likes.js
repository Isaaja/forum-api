exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("comment_likes", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    comment_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: '"comments"',
      onDelete: "CASCADE",
    },
    user_id: {
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

  // Add unique constraint to prevent duplicate likes
  pgm.addConstraint("comment_likes", "unique_comment_user_like", {
    unique: ["comment_id", "user_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("comment_likes");
};
