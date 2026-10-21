const Database = require("better-sqlite3");
const path = require("node:path");

const dbPath = process.env.DB_PATH || path.join(__dirname, "internships.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS internships (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  mode TEXT NOT NULL,
  duration_weeks INTEGER NOT NULL CHECK(duration_weeks > 0),
  applications_open INTEGER NOT NULL DEFAULT 1 CHECK(applications_open IN (0,1))
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  internship_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(id),
  UNIQUE (internship_id, applicant_email)
);
`);

const count = db.prepare("SELECT COUNT(*) AS count FROM internships").get().count;
if (count === 0) {
  const add = db.prepare(`INSERT INTO internships
    (id, title, domain, mode, duration_weeks, applications_open) VALUES (?, ?, ?, ?, ?, ?)`);
  const seed = db.transaction(() => {
    add.run("INT-001", "Python Full Stack Intern", "Software Development", "Hybrid", 8, 1);
    add.run("INT-002", "Frontend Developer Intern", "Web Development", "Remote", 6, 1);
    add.run("INT-003", "Data Analytics Intern", "Data Analytics", "On-site", 10, 1);
  });
  seed();
}
module.exports = db;