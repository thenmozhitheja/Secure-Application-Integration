const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("node:path");
const db = require("./database");

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." }
});
const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many application attempts. Please try again later." }
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));

app.get("/api/internships", (req, res) => {
  const rows = db.prepare(
    "SELECT id, title, domain, mode, duration_weeks, applications_open FROM internships ORDER BY title"
  ).all();
  res.json({ success: true, data: rows });
});

app.get("/api/internships/:id", (req, res) => {
  const id = String(req.params.id || "").trim();
  if (!id) return res.status(400).json({ success: false, error: "Invalid internship ID." });
  const item = db.prepare(
    "SELECT id, title, domain, mode, duration_weeks, applications_open FROM internships WHERE id = ?"
  ).get(id);
  if (!item) return res.status(404).json({ success: false, error: "Internship not found." });
  res.json({ success: true, data: item });
});

app.post("/api/internships/:id/applications", applicationLimiter, (req, res) => {
  const internshipId = String(req.params.id || "").trim();
  const name = typeof req.body?.applicant_name === "string" ? req.body.applicant_name.trim() : "";
  const email = typeof req.body?.applicant_email === "string" ? req.body.applicant_email.trim().toLowerCase() : "";

  if (!name || name.length < 2 || name.length > 80 || !/^[\p{L}\p{M} .'-]+$/u.test(name)) {
    return res.status(400).json({ success: false, error: "Enter a valid name (2–80 letters)." });
  }
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Enter a valid email address." });
  }
  const internship = db.prepare(
    "SELECT id, applications_open FROM internships WHERE id = ?"
  ).get(internshipId);
  if (!internship) return res.status(404).json({ success: false, error: "Internship not found." });
  if (internship.applications_open !== 1) {
    return res.status(409).json({ success: false, error: "Applications are closed for this internship." });
  }

  try {
    const result = db.prepare(
      "INSERT INTO applications (internship_id, applicant_name, applicant_email) VALUES (?, ?, ?)"
    ).run(internshipId, name, email);
    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: { id: Number(result.lastInsertRowid), internship_id: internshipId, applicant_name: name, applicant_email: email }
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ success: false, error: "This email has already applied for this internship." });
    }
    console.error("Application insert failed:", error.message);
    res.status(500).json({ success: false, error: "Unable to submit application right now." });
  }
});

// Avoid leaking stack traces or internal database details to clients.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ success: false, error: "Invalid JSON body." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, error: "Request body is too large." });
  }
  console.error("Unhandled request error:", err.message);
  res.status(500).json({ success: false, error: "Internal server error." });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Edvyro Task 4 running at http://localhost:${port}`));
}
module.exports = app;