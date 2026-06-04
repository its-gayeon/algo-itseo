import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "my_super_secret_interview_dashboard_key";

app.use(cors());
app.use(express.json());

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const result = await db.execute({
      sql: "INSERT INTO users (username, password) VALUES (?, ?)",
      args: [username, hashedPassword]
    });
    // LibSQL returns BigInt for lastInsertRowid, which needs to be converted to string or number
    const token = jwt.sign({ id: result.lastInsertRowid.toString(), username }, SECRET_KEY);
    res.json({ token, username });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed") || err.message.includes("SQLITE_CONSTRAINT")) {
      return res.status(400).json({ error: "Username already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username = ?",
      args: [username]
    });
    const user = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user.id.toString(), username: user.username }, SECRET_KEY);
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/solved", authenticateToken, async (req, res) => {
  const { title, difficulty, date } = req.body;
  try {
    const result = await db.execute({
      sql: "INSERT INTO solved_problems (user_id, title, difficulty, date) VALUES (?, ?, ?, ?)",
      args: [req.user.id, title, difficulty, date]
    });
    res.json({ id: result.lastInsertRowid.toString(), title, difficulty, date });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/solved", authenticateToken, async (req, res) => {
  const { title, date } = req.body;
  try {
    await db.execute({
      sql: "DELETE FROM solved_problems WHERE user_id = ? AND title = ? AND date = ?",
      args: [req.user.id, title, date]
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/community", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT sp.id, sp.title, sp.difficulty, sp.date, u.username 
      FROM solved_problems sp 
      JOIN users u ON sp.user_id = u.id 
      ORDER BY sp.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/community/users", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT u.username, COUNT(sp.id) as total_solved, GROUP_CONCAT(sp.date) as activity_dates
      FROM users u
      JOIN solved_problems sp ON u.id = sp.user_id
      GROUP BY u.id
      ORDER BY total_solved DESC
    `);
    const users = result.rows.map(r => ({
      username: r.username,
      total_solved: r.total_solved,
      activity: r.activity_dates ? r.activity_dates.split(',') : []
    }));
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve frontend in production (if running locally or as a standard node app)
app.use(express.static(path.join(__dirname, "../dist")));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Only listen if not running on Vercel Serverless Functions
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
