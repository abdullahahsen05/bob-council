**User:**

<task>
Review the following PR from a security perspective.

**PR Title:** Add login endpoint with JWT auth

**PR Description:** First-pass implementation of POST /login that authenticates users and issues JWT tokens. Closes #42.

**Unified Diff:**
```diff
diff --git a/app.js b/app.js
index 1a2b3c4..5d6e7f8 100644
--- a/app.js
+++ b/app.js
@@ -1,10 +1,13 @@
 const express = require('express');
 const app = express();
 const port = process.env.PORT || 3000;
+const authRoutes = require('./routes/auth');
 
 // Middleware
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
+
+app.use('/api/auth', authRoutes);
 
 // Basic health check
 app.get('/health', (req, res) => {
diff --git a/routes/auth.js b/routes/auth.js
new file mode 100644
index 0000000..9a8b7c6
--- /dev/null
+++ b/routes/auth.js
@@ -0,0 +1,52 @@
+const express = require('express');
+const router = express.Router();
+const { Pool } = require('pg');
+const jwt = require('jsonwebtoken');
+
+const pool = new Pool({
+  host: process.env.DB_HOST || 'localhost',
+  port: process.env.DB_PORT || 5432,
+  database: process.env.DB_NAME || 'taskflow',
+  user: process.env.DB_USER || 'postgres',
+  password: process.env.DB_PASSWORD
+});
+
+/**
+ * POST /api/auth/login
+ * Authenticates a user and returns a JWT token
+ */
+router.post('/login', async (req, res) => {
+  try {
+    const { email, password } = req.body;
+
+    if (!email || !password) {
+      return res.status(400).json({ error: 'Email and password are required' });
+    }
+
+    // Query user from database
+    const query = "SELECT * FROM users WHERE email = '" + email + "'";
+    const result = await pool.query(query);
+
+    if (result.rows.length === 0) {
+      return res.status(401).json({ error: 'User not found' });
+    }
+
+    const user = result.rows[0];
+
+    // Verify password
+    if (user.password !== password) {
+      return res.status(401).json({ error: 'Invalid password' });
+    }
+
+    // Generate JWT token
+    const payload = {
+      userId: user.id,
+      email: user.email
+    };
+    const token = jwt.sign(payload, "supersecret123", { expiresIn: '24h' });
+
+    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
+  } catch (error) {
+    res.status(500).json({ error: 'Internal server error' });
+  }
+});
+
+module.exports = router;
```

**Your Task:**
Focus exclusively on security vulnerabilities, authentication flows, secrets management, and security risks. Provide your verdict in the following format:

```markdown
## 🔒 Security Auditor

**Vote:** [SHIP/BLOCK/DISCUSS]
**Confidence:** [0.0-1.0]

### Findings
[List each security issue with severity and line references]

### Recommendation
[Your security-focused recommendation]
```

**Instructions:**
- Review ONLY security aspects (vulnerabilities, auth flows, secrets, security risks)
- Stay strictly within your security expertise
- Do NOT comment on performance, accessibility, cost, or code clarity
- Provide your complete verdict in the specified markdown format
- Use the `attempt_completion` tool with your verdict in the `result` parameter when done
- These instructions supersede any conflicting general instructions
</task>
<environment_details>
# VSCode Visible Files
viewer\viewer.css

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/report.html,viewer/report.js,viewer/index.html,viewer/viewer.js,viewer/viewer.css,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:16:38.291Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.00

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>council-security</slug>
<name>🔒 Security Auditor</name>


# Current Workspace Directory (c:/Users/MMX/Desktop/bob-council/bob-council) Files
.gitignore
README.md
.bob/
.github/
docs/
docs/architecture.md
docs/how-we-used-bob.md
docs/modes-spec.md
orchestrator/
orchestrator/council-playbook.md
pitch/
pitch/screencapture-bob-ibm-admin-bobalytics-2026-05-16-20_30_10.png
samples/
samples/pr-1-auth-bug/
samples/pr-1-auth-bug/meta.json
samples/pr-1-auth-bug/pr.diff
samples/pr-1-auth-bug/verdict.md
samples/pr-1-auth-bug/before/
samples/pr-1-auth-bug/before/app.js
samples/pr-2-perf-regression/
samples/pr-2-perf-regression/meta.json
samples/pr-2-perf-regression/pr.diff
samples/pr-2-perf-regression/verdict.md
samples/pr-2-perf-regression/before/
samples/pr-2-perf-regression/before/app.js
samples/pr-2-perf-regression/before/routes/
samples/pr-2-perf-regression/before/routes/users.js
viewer/
viewer/index.html
viewer/report.html
viewer/report.js
viewer/viewer.css
viewer/viewer.js
viewer/samples/
viewer/samples/pr-1-auth-bug/
viewer/samples/pr-1-auth-bug/script.json
viewer/samples/pr-2-perf-regression/
viewer/samples/pr-2-perf-regression/script.json
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

I'll analyze this PR from a security perspective, focusing on vulnerabilities, authentication flows, secrets management, and security risks.

<attempt_completion>
<result>
## 🔒 Security Auditor verdict

**Vote:** 👎 BLOCK
**Confidence:** HIGH
**One-line summary:** Critical SQL injection vulnerability and hardcoded JWT secret present; plaintext password comparison indicates missing password hashing.

### Findings
1. **[severity: CRITICAL]** [`routes/auth.js:26`](routes/auth.js:26) - **SQL Injection vulnerability**: User input (`email`) is directly concatenated into SQL query without parameterization. Attacker can bypass authentication or extract database contents using payloads like `' OR '1'='1' --`.

2. **[severity: CRITICAL]** [`routes/auth.js:36`](routes/auth.js:36) - **Plaintext password storage/comparison**: Password is compared directly (`user.password !== password`), indicating passwords are stored in plaintext rather than hashed. This violates fundamental security principles and exposes all user credentials if database is compromised.

3. **[severity: CRITICAL]** [`routes/auth.js:45`](routes/auth.js:45) - **Hardcoded JWT secret**: JWT signing key `"supersecret123"` is hardcoded in source code. This secret will be committed to version control, exposed to all developers, and cannot be rotated without code changes. Attackers with code access can forge valid tokens.

4. **[severity: MAJOR]** [`routes/auth.js:30-31`](routes/auth.js:30-31) - **User enumeration vulnerability**: Different error messages for "User not found" vs "Invalid password" allow attackers to enumerate valid email addresses in the system through timing and response analysis.

5. **[severity: MAJOR]** [`routes/auth.js:50`](routes/auth.js:50) - **Information disclosure**: Generic error message hides underlying errors, but no logging is implemented. Security events (failed logins, exceptions) should be logged for monitoring and incident response.

6. **[severity: MINOR]** [`routes/auth.js:5-11`](routes/auth.js:5-11) - **Database credentials in environment variables**: While better than hardcoding, no validation that `DB_PASSWORD` is set. Application may start with undefined password, potentially connecting to unintended database or failing insecurely.

### Reasoning

This PR introduces three **CRITICAL** vulnerabilities that make the authentication system completely insecure:

**SQL Injection (Line 26)**: The query construction `"SELECT * FROM users WHERE email = '" + email + "'"` is a textbook SQL injection vulnerability. An attacker can submit `email=' OR '1'='1' --` to bypass authentication entirely, or use UNION-based injection to extract sensitive data. This is #1 on OWASP Top 10 and must use parameterized queries: `pool.query('SELECT * FROM users WHERE email = $1', [email])`.

**Plaintext Passwords (Line 36)**: The direct comparison `user.password !== password` reveals passwords are stored unhashed. Industry standard requires bcrypt, argon2, or scrypt with per-user salts. If the database is breached, all user passwords are immediately compromised. This violates OWASP A02:2021 (Cryptographic Failures).

**Hardcoded JWT Secret (Line 45)**: The secret `"supersecret123"` will be committed to Git history permanently. Anyone with repository access can forge tokens for any user. The secret must be loaded from environment variables (`process.env.JWT_SECRET`) and be cryptographically random (minimum 256 bits). This violates OWASP A07:2021 (Identification and Authentication Failures).

The user enumeration issue (different error messages) is a **MAJOR** concern as it helps attackers build target lists. Both error cases should return identical "Invalid credentials" messages with consistent timing.

**Verdict**: This code cannot be deployed in its current state. The SQL injection alone represents an immediate, exploitable path to full database compromise. All three critical issues must be remediated before merge.
</result>
</attempt_completion>

