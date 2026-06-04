import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(__dirname, "database.sqlite")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({
  url,
  authToken,
});

async function initDb() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS solved_problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        difficulty TEXT,
        date TEXT,
        url TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);
    
    // Add url column if it doesn't exist
    try {
      await db.execute("ALTER TABLE solved_problems ADD COLUMN url TEXT");
    } catch (e) {
      // Ignore if column already exists
    }
    
    console.log("Connected to the Turso/SQLite database and tables verified.");
  } catch (err) {
    console.error("Error creating tables:", err.message);
  }
}

// Call initDb asynchronously
initDb();

export default db;
