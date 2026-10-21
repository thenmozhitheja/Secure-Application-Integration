const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tempDb = path.join(os.tmpdir(), `edvyro-task4-test-${process.pid}.sqlite`);
process.env.DB_PATH = tempDb;
const app = require("../server");
const db = require("../database");

test("GET /api/health returns healthy status and security headers", async () => {
  const res = await request(app).get("/api/health").expect(200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, "ok");
  assert.ok(res.headers["x-content-type-options"]);
  assert.equal(res.headers["x-powered-by"], undefined);
});

test("GET /api/internships returns seeded internship records", async () => {
  const res = await request(app).get("/api/internships").expect(200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test("application rejects invalid email", async () => {
  const res = await request(app).post("/api/internships/INT-001/applications")
    .send({ applicant_name: "Test User", applicant_email: "not-an-email" }).expect(400);
  assert.match(res.body.error, /email/i);
});

test("application rejects invalid name", async () => {
  const res = await request(app).post("/api/internships/INT-001/applications")
    .send({ applicant_name: "X", applicant_email: "test@example.com" }).expect(400);
  assert.match(res.body.error, /name/i);
});

test("valid application is stored and duplicate email is rejected", async () => {
  const email = `applicant-${Date.now()}@example.com`;
  const payload = { applicant_name: "Test Applicant", applicant_email: email };
  const first = await request(app).post("/api/internships/INT-001/applications").send(payload).expect(201);
  assert.equal(first.body.success, true);
  const second = await request(app).post("/api/internships/INT-001/applications").send(payload).expect(409);
  assert.match(second.body.error, /already applied/i);
});

test("unknown internship returns 404", async () => {
  const res = await request(app).post("/api/internships/DOES-NOT-EXIST/applications")
    .send({ applicant_name: "Test Applicant", applicant_email: "valid@example.com" }).expect(404);
  assert.match(res.body.error, /not found/i);
});

test("malformed JSON returns a safe 400 response", async () => {
  const res = await request(app).post("/api/internships/INT-001/applications")
    .set("Content-Type", "application/json").send('{"applicant_name":').expect(400);
  assert.equal(res.body.error, "Invalid JSON body.");
});

test.after(() => {
  try { db.close(); } catch {}
  for (const suffix of ["", "-shm", "-wal"]) {
    try { fs.unlinkSync(tempDb + suffix); } catch {}
  }
});