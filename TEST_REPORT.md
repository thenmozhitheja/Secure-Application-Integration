# Automated test report

## How to execute
Run:
```bash
npm install
npm test
```

For a saved terminal report:
```bash
npm run test:report
```

## Test cases included
1. Health endpoint returns success and security headers.
2. Internship listing returns an array.
3. Invalid email is rejected with HTTP 400.
4. Invalid applicant name is rejected with HTTP 400.
5. Valid application is saved and duplicate email is rejected with HTTP 409.
6. Unknown internship ID returns HTTP 404.
7. Malformed JSON returns a safe HTTP 400 error.

Record the actual test output after running the suite. Do not claim tests passed unless the command finishes successfully.