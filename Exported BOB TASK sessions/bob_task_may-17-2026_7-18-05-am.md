**User:**

<task>
Review the following PR from an accessibility perspective.

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
Focus exclusively on WCAG compliance, assistive technology support, and inclusive design. Provide your verdict in the following format:

```markdown
## ♿ Accessibility Inspector

**Vote:** [SHIP/BLOCK/DISCUSS]
**Confidence:** [0.0-1.0]

### Findings
[List each accessibility issue with severity and line references]

### Recommendation
[Your accessibility-focused recommendation]
```

**Instructions:**
- Review ONLY accessibility aspects (WCAG compliance, assistive technology support, inclusive design)
- Stay strictly within your accessibility expertise
- Do NOT comment on security, performance, cost, or code clarity
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
Current time in ISO 8601 UTC format: 2026-05-17T02:17:52.084Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.00

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>council-accessibility</slug>
<name>♿ Accessibility Inspector</name>


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

I'll review this PR from an accessibility perspective, focusing exclusively on WCAG compliance, assistive technology support, and inclusive design.

<attempt_completion>
<result>
## ♿ Accessibility Inspector verdict

**Vote:** 👍 SHIP
**Confidence:** HIGH
**One-line summary:** Backend API endpoint with no user-facing UI components - no accessibility concerns identified.

### Findings
No accessibility issues identified. This PR implements a backend authentication endpoint without any user interface components.

### Reasoning
This pull request adds a backend authentication endpoint (`POST /api/auth/login`) that handles JWT token generation. From an accessibility perspective, this change has no direct impact on users with disabilities because:

1. **No UI Components**: The PR contains only server-side Node.js/Express code with no HTML, CSS, or client-side JavaScript that would render user interface elements. There are no forms, buttons, labels, or interactive elements to evaluate for WCAG compliance.

2. **API-Only Changes**: The authentication logic is purely backend functionality. While the API responses include JSON error messages (e.g., "Email and password are required", "User not found"), these are consumed by client applications, not directly presented to users. The accessibility of these messages depends entirely on how the consuming frontend implements them.

3. **No Assistive Technology Concerns**: Since there are no DOM elements, ARIA attributes, semantic HTML, keyboard interactions, or visual elements, there are no screen reader, keyboard navigation, or focus management considerations.

**Important Note for Frontend Implementation**: When a frontend consumes this API, developers must ensure that:
- Login form fields have proper `<label>` elements associated with inputs
- Error messages from the API are announced to screen readers (using ARIA live regions)
- Form validation provides accessible feedback
- Password fields are properly marked with `type="password"`
- Submit buttons are keyboard accessible

However, these frontend accessibility requirements are outside the scope of this backend-only PR.

**Vote Justification**: I vote 👍 SHIP with HIGH confidence because this PR introduces no accessibility barriers. Backend API changes cannot violate WCAG criteria as they don't produce user-facing content or interactions. The accessibility responsibility lies with the client applications that consume this endpoint.
</result>
</attempt_completion>

