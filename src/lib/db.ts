import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const databaseDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

const databaseFilePath = path.join(databaseDirectory, "sqlite.db");
const databaseConnection = new Database(databaseFilePath);

databaseConnection.pragma("journal_mode = WAL");
databaseConnection.pragma("foreign_keys = ON");

databaseConnection.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    paidById TEXT NOT NULL,
    expenseForId TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paidById) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (expenseForId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_paidById ON expenses(paidById);
  CREATE INDEX IF NOT EXISTS idx_expenses_expenseForId ON expenses(expenseForId);
`);

const totalUsersQuery = databaseConnection
  .prepare("SELECT COUNT(*) as total FROM users")
  .get() as { total: number };

if (totalUsersQuery.total === 0) {
  const insertUserStatement = databaseConnection.prepare(
    "INSERT INTO users (id, name) VALUES (?, ?)",
  );

  const insertExpenseStatement = databaseConnection.prepare(
    "INSERT INTO expenses (id, amount, description, paidById, expenseForId) VALUES (?, ?, ?, ?, ?)",
  );

  const seedInitialData = databaseConnection.transaction(() => {
    const aliceId = randomUUID();
    const bobId = randomUUID();
    const charlieId = randomUUID();
    const davidId = randomUUID();

    insertUserStatement.run(aliceId, "Alice");
    insertUserStatement.run(bobId, "Bob");
    insertUserStatement.run(charlieId, "Charlie");
    insertUserStatement.run(davidId, "David");

    insertExpenseStatement.run(
      randomUUID(),
      120,
      "Team Dinner",
      bobId,
      aliceId,
    );
    insertExpenseStatement.run(
      randomUUID(),
      50,
      "Groceries",
      aliceId,
      charlieId,
    );
    insertExpenseStatement.run(randomUUID(), 30, "Taxi Fare", bobId, davidId);
  });

  seedInitialData();
}

export default databaseConnection;
