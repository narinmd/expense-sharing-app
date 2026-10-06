import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const databaseDirectory =
  process.env.NODE_ENV === "production"
    ? "/app/data"
    : path.join(process.cwd(), "data");

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

const databaseFilePath = path.join(databaseDirectory, "app.db");

declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: Database.Database | undefined;
}

function getDatabase(): Database.Database {
  if (!global.__dbInstance) {
    const db = new Database(databaseFilePath, { timeout: 15000 });

    db.pragma("busy_timeout = 15000");

    try {
      db.pragma("journal_mode = WAL");
      db.pragma("foreign_keys = ON");

      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS group_members (
          groupId TEXT NOT NULL,
          userId TEXT NOT NULL,
          PRIMARY KEY (groupId, userId)
        );

        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY,
          groupId TEXT NOT NULL,
          paidById TEXT NOT NULL,
          expenseForId TEXT NOT NULL,
          amount REAL NOT NULL,
          description TEXT NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS expense_splits (
          id TEXT PRIMARY KEY,
          expenseId TEXT NOT NULL,
          userId TEXT NOT NULL,
          amount REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settlements (
          id TEXT PRIMARY KEY,
          groupId TEXT NOT NULL,
          fromUserId TEXT NOT NULL,
          toUserId TEXT NOT NULL,
          amount REAL NOT NULL,
          date DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const alterStatements = [
        "ALTER TABLE users ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE groups ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE expenses ADD COLUMN paidById TEXT;",
        "ALTER TABLE expenses ADD COLUMN groupId TEXT;",
        "ALTER TABLE expenses ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE expense_splits ADD COLUMN expenseId TEXT;",
        "ALTER TABLE expense_splits ADD COLUMN userId TEXT;",
        "ALTER TABLE settlements ADD COLUMN groupId TEXT;",
        "ALTER TABLE settlements ADD COLUMN fromUserId TEXT;",
        "ALTER TABLE settlements ADD COLUMN toUserId TEXT;",
        "ALTER TABLE expenses ADD COLUMN expenseForId TEXT;",
      ];

      for (const stmt of alterStatements) {
        try {
          db.exec(stmt);
        } catch {}
      }

      const userCount = db
        .prepare("SELECT COUNT(*) as count FROM users")
        .get() as { count: number };

      if (userCount.count === 0) {
        const u1 = randomUUID();
        const u2 = randomUUID();
        const u3 = randomUUID();
        const u4 = randomUUID();

        const users = [
          { id: u1, name: "Alice", email: "alice@example.com" },
          { id: u2, name: "Bob", email: "bob@example.com" },
          { id: u3, name: "Charlie", email: "charlie@example.com" },
          { id: u4, name: "David", email: "david@example.com" },
        ];

        const groupId = randomUUID();
        const expenseId = randomUUID();

        const insertUser = db.prepare(
          "INSERT INTO users (id, name, email) VALUES (?, ?, ?)",
        );
        const insertGroup = db.prepare(
          "INSERT INTO groups (id, name) VALUES (?, ?)",
        );
        const insertMember = db.prepare(
          "INSERT INTO group_members (groupId, userId) VALUES (?, ?)",
        );
        const insertExpense = db.prepare(
          "INSERT INTO expenses (id, groupId, paidById, expenseForId, amount, description) VALUES (?, ?, ?, ?, ?, ?)",
        );

        const insertInitialData = db.transaction(() => {
          insertGroup.run(groupId, "Trip to Paris");
          for (const user of users) {
            insertUser.run(user.id, user.name, user.email);
            insertMember.run(groupId, user.id);
          }
          insertExpense.run(
            expenseId,
            groupId,
            u1,
            u2,
            150.0,
            "Welcome Dinner",
          );
        });

        insertInitialData();
      }
    } catch (error: any) {
      if (error.code !== "SQLITE_BUSY") {
        throw error;
      }
    }

    global.__dbInstance = db;
  }

  return global.__dbInstance;
}

const db = getDatabase();

export default db;
