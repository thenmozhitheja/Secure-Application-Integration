# Edvyro Task 4 — Secure Application Integration

A small internship portal demonstrating frontend/API integration, form validation, SQLite persistence, API rate limiting, secure HTTP headers, and automated tests.

## Features
- Responsive internship listing UI populated by the backend API.
- Loading state, empty state, error message, and retry action.
- Application form with client-side and server-side validation.
- Duplicate applications for the same internship/email are prevented.
- SQLite statements use parameterized queries.
- `helmet` adds common security headers; Express `x-powered-by` is disabled.
- API rate limiting: general API requests and stricter application submission limit.
- JSON request size limited to 20 KB; safe error responses avoid leaking database details.
- Automated tests use Node's built-in test runner and Supertest.

## Requirements
- Node.js 22 LTS or a compatible supported Node.js version.
- npm.

## Run locally
```bash
npm install
npm start
```
Open http://localhost:3000

Health endpoint: http://localhost:3000/api/health  
Internships endpoint: http://localhost:3000/api/internships

## Run tests
```bash
npm test
```
To save test output to `test-report.txt`:
```bash
npm run test:report
```

## API summary
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health status |
| GET | `/api/internships` | List internships |
| GET | `/api/internships/:id` | Get one internship |
| POST | `/api/internships/:id/applications` | Submit an application |

Example application body:
```json
{
  "applicant_name": "Example Applicant",
  "applicant_email": "applicant@example.com"
}
```

## Security checklist
- [x] Parameterized SQL queries (avoid SQL injection)
- [x] Server-side validation of name, email, internship existence, and application status
- [x] Client-side validation for usability (not trusted as the only validation)
- [x] Rate limiting for API and application submission
- [x] Helmet security headers and disabled `X-Powered-By`
- [x] JSON body size limit
- [x] Safe client-facing errors; internal details are logged server-side only
- [x] Duplicate applications constrained by a database unique key
- [x] Accessible status messages and labels in the frontend
- [ ] Production deployment: use HTTPS, configure trusted proxy only when deployed behind one, and set operational monitoring
- [ ] Production identity verification/authentication is not included in this learning demo

## Test report
Run `npm test` to execute the automated test suite. The suite covers health/security headers, listing internships, invalid name/email validation, successful application creation, duplicate rejection, unknown internship handling, and malformed JSON handling. Save a report using `npm run test:report`.

## Notes
This is a learning/demo project, not a production hiring platform. Do not submit real sensitive personal information. The SQLite database is created automatically on first run and is intentionally excluded from version control.
