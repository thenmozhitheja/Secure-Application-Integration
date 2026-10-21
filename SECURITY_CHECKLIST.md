# Security checklist — Edvyro Task 4

- Parameterized SQLite statements are used for reads and writes.
- API inputs are validated on the server, regardless of browser-side checks.
- Email addresses are normalized to lowercase and duplicate applications are rejected by a unique database constraint.
- API endpoints have rate limits; application submission has a stricter limit.
- Helmet security headers are enabled; `X-Powered-By` is disabled.
- JSON request bodies are limited to 20 KB.
- Error responses do not reveal SQL statements, filesystem paths, or stack traces.
- Frontend inserts server data using `textContent`, not `innerHTML`.
- Production deployment should use HTTPS and a managed database/backups if required.
- Authentication/authorization and email verification are outside the scope of this demonstration and would be required for a real application handling personal data.