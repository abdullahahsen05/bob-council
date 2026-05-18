**User:**

<task>
Completely remove the code-row highlight feature. The Prism line-highlight plugin, the red/yellow band, and all related severity-color overlay logic must go.

REMOVE:
1. viewer/index.html — delete the prism-line-highlight CSS <link> and JS <script> tags added in a prior session.
2. viewer/viewer.css — delete the .line-highlight overrides, .highlight-critical, .highlight-mild, and any related severity-color row styling. Delete the @keyframes for highlight-sweep if present.
3. viewer/viewer.js — in renderCode (and scene-advance code paths), remove the data-line setting on <pre>. Remove the pre[data-severity] attribute setting. Remove any code that triggers Prism.plugins.lineHighlight. Remove the severity → highlight-class mapping. Remove utterance.onstart hooks that trigger highlight animations.

KEEP:
- Gutter line numbers via Prism line-numbers plugin (data-start logic). Real file line numbers must still display.
- The severity pill in the verdict side rail (CRITICAL / MAJOR / MILD card) — that's metadata text, not the row highlight. Leave it untouched.
- Next-button single-advance guard. Auto-advance. Everything else.

CONSTRAINTS:
- Edit only viewer/index.html, viewer/viewer.css, viewer/viewer.js.
- Do not touch script.json, samples/, verdict.md.

After: 1-line diff summary per file. DO NOT commit.
</task>
<environment_details>
# VSCode Visible Files
viewer\viewer.css

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/index.html,viewer/viewer.js,viewer/viewer.css,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:17.415Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.00

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>


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

I'll help you completely remove the code-row highlight feature. Let me start by examining the current state of the files to identify all the highlight-related code.

<read_file>
<args>
<file>
<path>viewer/index.html</path>
</file>
<file>
<path>viewer/viewer.css</path>
</file>
<file>
<path>viewer/viewer.js</path>
</file>
</args>
</read_file>

---

**User:**

[read_file for 'viewer/index.html', 'viewer/viewer.css', 'viewer/viewer.js'] Result:
<files>
<file><path>viewer/index.html</path>
<content lines="1-102">
  1 | <!DOCTYPE html>
  2 | <html lang="en">
  3 | <head>
  4 |   <meta charset="UTF-8">
  5 |   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  6 |   <title>Bob Council - Code Review Walkthroughs</title>
  7 |   
  8 |   <!-- Google Fonts -->
  9 |   <link rel="preconnect" href="https://fonts.googleapis.com">
 10 |   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
 11 |   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
 12 |   
 13 |   <!-- Prism.js for syntax highlighting -->
 14 |   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
 15 |   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
 16 |   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.min.css">
 17 |   
 18 |   <link rel="stylesheet" href="viewer.css">
 19 | </head>
 20 | <body>
 21 |   <!-- Landing Page (shown when no ?pr= param) -->
 22 |   <div id="landing-page" class="landing-page">
 23 |     <header class="landing-header">
 24 |       <h1>🎭 Bob Council</h1>
 25 |       <p class="subtitle">Multi-persona AI code review walkthroughs</p>
 26 |     </header>
 27 |     
 28 |     <main class="landing-main">
 29 |       <div class="walkthroughs-grid" id="walkthroughs-grid">
 30 |         <!-- Cards will be dynamically inserted here -->
 31 |       </div>
 32 |     </main>
 33 |     
 34 |     <footer class="landing-footer">
 35 |       <p>Built with <a href="https://bob.ibm.com" target="_blank">IBM Bob</a> • Orchestrator + 7 custom modes</p>
 36 |     </footer>
 37 |   </div>
 38 |   
 39 |   <!-- Player (shown when ?pr=<slug> param exists) -->
 40 |   <div id="player" class="player" style="display: none;">
 41 |     <header class="player-header">
 42 |       <div class="header-top">
 43 |         <a href="index.html" class="back-link">← Back to all walkthroughs</a>
 44 |         <div class="verdict-pill" id="verdict-pill">LOADING</div>
 45 |       </div>
 46 |       <h1 class="pr-title" id="pr-title">Loading...</h1>
 47 |       <div class="vote-tally" id="vote-tally">Loading...</div>
 48 |     </header>
 49 |     
 50 |     <main class="player-main">
 51 |       <div class="code-panel" id="code-panel">
 52 |         <div class="code-header">
 53 |           <span class="file-name" id="file-name">Loading...</span>
 54 |         </div>
 55 |         <pre class="line-numbers"><code class="language-javascript" id="code-content"></code></pre>
 56 |       </div>
 57 |       
 58 |       <aside class="annotation-panel" id="annotation-panel">
 59 |         <div class="annotation-card">
 60 |           <div class="annotation-severity" id="annotation-severity">INFO</div>
 61 |           <div class="annotation-message" id="annotation-message">Loading...</div>
 62 |         </div>
 63 |       </aside>
 64 |     </main>
 65 |     
 66 |     <div class="caption-bar" id="caption-bar">
 67 |       <p id="caption-text">Loading narration...</p>
 68 |     </div>
 69 |     
 70 |     <footer class="player-controls">
 71 |       <div class="controls-left">
 72 |         <button id="btn-play" class="control-btn" title="Play">▶</button>
 73 |         <button id="btn-pause" class="control-btn" style="display: none;" title="Pause">⏸</button>
 74 |         <button id="btn-prev" class="control-btn" title="Previous scene">⏮</button>
 75 |         <button id="btn-next" class="control-btn" title="Next scene">⏭</button>
 76 |       </div>
 77 |       
 78 |       <div class="controls-center">
 79 |         <span class="scene-indicator" id="scene-indicator">1 / 1</span>
 80 |         <div class="progress-bar">
 81 |           <div class="progress-fill" id="progress-fill"></div>
 82 |         </div>
 83 |       </div>
 84 |       
 85 |       <div class="controls-right">
 86 |         <!-- Reserved for future features -->
 87 |       </div>
 88 |     </footer>
 89 |   </div>
 90 |   
 91 |   <!-- Prism.js -->
 92 |   <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
 93 |   <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
 94 |   <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.min.js"></script>
 95 |   <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
 96 |   <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
 97 |   <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-css.min.js"></script>
 98 |   <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
 99 |   
100 |   <script src="viewer.js"></script>
101 | </body>
102 | </html>
</content>
</file>
<file><path>viewer/viewer.css</path>
<content lines="1-616">
  1 | /* Bob Council Viewer - Dark theme with premium feel */
  2 | /* Built with IBM Bob Code mode */
  3 | 
  4 | /* ============================================================================
  5 |    RESET & BASE STYLES
  6 |    ============================================================================ */
  7 | 
  8 | * {
  9 |   margin: 0;
 10 |   padding: 0;
 11 |   box-sizing: border-box;
 12 | }
 13 | 
 14 | :root {
 15 |   /* Colors */
 16 |   --bg-primary: #0f1419;
 17 |   --bg-secondary: #1a1f29;
 18 |   --bg-tertiary: #252b37;
 19 |   --text-primary: #e6edf3;
 20 |   --text-secondary: #8b949e;
 21 |   --text-muted: #6e7681;
 22 |   
 23 |   /* Verdict colors */
 24 |   --verdict-ship: #10b981;
 25 |   --verdict-block: #ef4444;
 26 |   --verdict-discuss: #f59e0b;
 27 |   
 28 |   /* Severity colors */
 29 |   --severity-critical: #ef4444;
 30 |   --severity-major: #f97316;
 31 |   --severity-minor: #eab308;
 32 |   --severity-info: #3b82f6;
 33 |   
 34 |   /* Highlight */
 35 |   --highlight-bg: rgba(251, 191, 36, 0.15);
 36 |   --highlight-border: #fbbf24;
 37 |   
 38 |   /* Spacing */
 39 |   --spacing-xs: 0.25rem;
 40 |   --spacing-sm: 0.5rem;
 41 |   --spacing-md: 1rem;
 42 |   --spacing-lg: 1.5rem;
 43 |   --spacing-xl: 2rem;
 44 |   
 45 |   /* Typography */
 46 |   --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
 47 |   --font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
 48 | }
 49 | 
 50 | body {
 51 |   font-family: var(--font-ui);
 52 |   background: var(--bg-primary);
 53 |   color: var(--text-primary);
 54 |   line-height: 1.6;
 55 |   min-height: 100vh;
 56 | }
 57 | 
 58 | a {
 59 |   color: #58a6ff;
 60 |   text-decoration: none;
 61 |   transition: color 0.2s;
 62 | }
 63 | 
 64 | a:hover {
 65 |   color: #79c0ff;
 66 | }
 67 | 
 68 | /* ============================================================================
 69 |    LANDING PAGE
 70 |    ============================================================================ */
 71 | 
 72 | .landing-page {
 73 |   min-height: 100vh;
 74 |   display: flex;
 75 |   flex-direction: column;
 76 | }
 77 | 
 78 | .landing-header {
 79 |   text-align: center;
 80 |   padding: var(--spacing-xl) var(--spacing-lg);
 81 |   border-bottom: 1px solid var(--bg-tertiary);
 82 | }
 83 | 
 84 | .landing-header h1 {
 85 |   font-size: 3rem;
 86 |   font-weight: 700;
 87 |   margin-bottom: var(--spacing-sm);
 88 |   background: linear-gradient(135deg, #58a6ff 0%, #a371f7 100%);
 89 |   -webkit-background-clip: text;
 90 |   -webkit-text-fill-color: transparent;
 91 |   background-clip: text;
 92 | }
 93 | 
 94 | .landing-header .subtitle {
 95 |   font-size: 1.25rem;
 96 |   color: var(--text-secondary);
 97 | }
 98 | 
 99 | .landing-main {
100 |   flex: 1;
101 |   padding: var(--spacing-xl);
102 |   max-width: 1400px;
103 |   margin: 0 auto;
104 |   width: 100%;
105 | }
106 | 
107 | .walkthroughs-grid {
108 |   display: grid;
109 |   grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
110 |   gap: var(--spacing-lg);
111 | }
112 | 
113 | .walkthrough-card {
114 |   background: var(--bg-secondary);
115 |   border: 1px solid var(--bg-tertiary);
116 |   border-radius: 12px;
117 |   padding: var(--spacing-lg);
118 |   transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
119 | }
120 | 
121 | .walkthrough-card:hover {
122 |   transform: translateY(-4px);
123 |   border-color: #58a6ff;
124 |   box-shadow: 0 8px 24px rgba(88, 166, 255, 0.15);
125 | }
126 | 
127 | .card-header {
128 |   display: flex;
129 |   justify-content: space-between;
130 |   align-items: flex-start;
131 |   gap: var(--spacing-md);
132 |   margin-bottom: var(--spacing-md);
133 | }
134 | 
135 | .card-header h3 {
136 |   font-size: 1.25rem;
137 |   font-weight: 600;
138 |   flex: 1;
139 | }
140 | 
141 | .verdict-badge {
142 |   padding: 0.25rem 0.75rem;
143 |   border-radius: 6px;
144 |   font-size: 0.75rem;
145 |   font-weight: 600;
146 |   text-transform: uppercase;
147 |   letter-spacing: 0.5px;
148 |   white-space: nowrap;
149 | }
150 | 
151 | .verdict-badge.verdict-ship {
152 |   background: rgba(16, 185, 129, 0.15);
153 |   color: var(--verdict-ship);
154 | }
155 | 
156 | .verdict-badge.verdict-block {
157 |   background: rgba(239, 68, 68, 0.15);
158 |   color: var(--verdict-block);
159 | }
160 | 
161 | .verdict-badge.verdict-discuss {
162 |   background: rgba(245, 158, 11, 0.15);
163 |   color: var(--verdict-discuss);
164 | }
165 | 
166 | .card-description {
167 |   color: var(--text-secondary);
168 |   margin-bottom: var(--spacing-md);
169 |   font-size: 0.95rem;
170 | }
171 | 
172 | .card-votes {
173 |   color: var(--text-muted);
174 |   font-size: 0.9rem;
175 |   margin-bottom: var(--spacing-lg);
176 |   font-family: var(--font-mono);
177 | }
178 | 
179 | .card-button {
180 |   display: inline-block;
181 |   padding: 0.75rem 1.5rem;
182 |   background: #58a6ff;
183 |   color: #0f1419;
184 |   border-radius: 8px;
185 |   font-weight: 600;
186 |   transition: background 0.2s, transform 0.1s;
187 | }
188 | 
189 | .card-button:hover {
190 |   background: #79c0ff;
191 |   transform: scale(1.02);
192 | }
193 | 
194 | .landing-footer {
195 |   text-align: center;
196 |   padding: var(--spacing-lg);
197 |   border-top: 1px solid var(--bg-tertiary);
198 |   color: var(--text-muted);
199 |   font-size: 0.9rem;
200 | }
201 | 
202 | /* ============================================================================
203 |    PLAYER
204 |    ============================================================================ */
205 | 
206 | .player {
207 |   height: 100vh;
208 |   display: flex;
209 |   flex-direction: column;
210 |   overflow: hidden;
211 | }
212 | 
213 | .player-header {
214 |   flex-shrink: 0;
215 |   padding: var(--spacing-lg);
216 |   border-bottom: 1px solid var(--bg-tertiary);
217 |   background: var(--bg-secondary);
218 | }
219 | 
220 | .header-top {
221 |   display: flex;
222 |   justify-content: space-between;
223 |   align-items: center;
224 |   margin-bottom: var(--spacing-md);
225 | }
226 | 
227 | .back-link {
228 |   font-size: 0.9rem;
229 |   color: var(--text-secondary);
230 | }
231 | 
232 | .back-link:hover {
233 |   color: var(--text-primary);
234 | }
235 | 
236 | .verdict-pill {
237 |   padding: 0.5rem 1rem;
238 |   border-radius: 8px;
239 |   font-size: 0.85rem;
240 |   font-weight: 700;
241 |   text-transform: uppercase;
242 |   letter-spacing: 0.5px;
243 | }
244 | 
245 | .verdict-pill.verdict-ship {
246 |   background: var(--verdict-ship);
247 |   color: white;
248 | }
249 | 
250 | .verdict-pill.verdict-block {
251 |   background: var(--verdict-block);
252 |   color: white;
253 | }
254 | 
255 | .verdict-pill.verdict-discuss {
256 |   background: var(--verdict-discuss);
257 |   color: white;
258 | }
259 | 
260 | .pr-title {
261 |   font-size: 1.75rem;
262 |   font-weight: 600;
263 |   margin-bottom: var(--spacing-sm);
264 | }
265 | 
266 | .vote-tally {
267 |   font-size: 1rem;
268 |   color: var(--text-secondary);
269 |   font-family: var(--font-mono);
270 | }
271 | 
272 | .contentiousness {
273 |   margin-left: var(--spacing-sm);
274 |   color: var(--text-muted);
275 | }
276 | 
277 | .player-main {
278 |   flex: 1;
279 |   display: grid;
280 |   grid-template-columns: 1fr 400px;
281 |   gap: var(--spacing-lg);
282 |   padding: var(--spacing-lg);
283 |   overflow: hidden;
284 |   min-height: 0;
285 | }
286 | 
287 | /* ============================================================================
288 |    CODE PANEL
289 |    ============================================================================ */
290 | 
291 | .code-panel {
292 |   background: var(--bg-secondary);
293 |   border: 1px solid var(--bg-tertiary);
294 |   border-radius: 12px;
295 |   overflow: hidden;
296 |   display: flex;
297 |   flex-direction: column;
298 |   transition: opacity 0.2s;
299 | }
300 | 
301 | .code-header {
302 |   padding: var(--spacing-md);
303 |   border-bottom: 1px solid var(--bg-tertiary);
304 |   background: var(--bg-tertiary);
305 | }
306 | 
307 | .file-name {
308 |   font-family: var(--font-mono);
309 |   font-size: 0.9rem;
310 |   color: var(--text-secondary);
311 | }
312 | 
313 | .code-panel pre {
314 |   margin: 0;
315 |   padding: var(--spacing-lg);
316 |   overflow: auto;
317 |   flex: 1;
318 |   background: var(--bg-secondary);
319 | }
320 | 
321 | .code-panel code {
322 |   font-family: var(--font-mono);
323 |   font-size: 0.9rem;
324 |   line-height: 1.6;
325 | }
326 | 
327 | /* Line numbers */
328 | .line-numbers .line-numbers-rows {
329 |   border-right: 1px solid var(--bg-tertiary);
330 |   padding-right: var(--spacing-md);
331 |   margin-right: var(--spacing-md);
332 | }
333 | 
334 | .line-numbers-rows > span {
335 |   display: block;
336 |   color: var(--text-muted);
337 |   font-family: var(--font-mono);
338 |   font-size: 0.9rem;
339 |   line-height: 1.6;
340 | }
341 | 
342 | /* Made with Bob - Prism line-highlight plugin styling with severity colors */
343 | /* Default critical severity - red highlight */
344 | .line-highlight {
345 |   background: rgba(239, 68, 68, 0.30) !important;
346 |   border-left: 4px solid #ef4444 !important;
347 |   --highlight-duration: 2.5s;
348 | }
349 | 
350 | /* Non-critical severities - yellow highlight */
351 | pre[data-severity="major"] .line-highlight,
352 | pre[data-severity="minor"] .line-highlight,
353 | pre[data-severity="info"] .line-highlight {
354 |   background: rgba(234, 179, 8, 0.30) !important;
355 |   border-left-color: #eab308 !important;
356 | }
357 | 
358 | /* Karaoke animation */
359 | .line-highlight.animate-in {
360 |   animation: line-highlight-sweep var(--highlight-duration) ease-out forwards;
361 | }
362 | 
363 | @keyframes line-highlight-sweep {
364 |   0% {
365 |     opacity: 0;
366 |     transform: scaleX(0);
367 |     transform-origin: left;
368 |   }
369 |   100% {
370 |     opacity: 1;
371 |     transform: scaleX(1);
372 |   }
373 | }
374 | /* End Made with Bob */
375 | 
376 | /* ============================================================================
377 |    ANNOTATION PANEL
378 |    ============================================================================ */
379 | 
380 | .annotation-panel {
381 |   display: flex;
382 |   flex-direction: column;
383 | }
384 | 
385 | .annotation-card {
386 |   background: var(--bg-secondary);
387 |   border: 1px solid var(--bg-tertiary);
388 |   border-radius: 12px;
389 |   padding: var(--spacing-lg);
390 |   position: sticky;
391 |   top: var(--spacing-lg);
392 | }
393 | 
394 | .annotation-severity {
395 |   display: inline-block;
396 |   padding: 0.25rem 0.75rem;
397 |   border-radius: 6px;
398 |   font-size: 0.75rem;
399 |   font-weight: 700;
400 |   text-transform: uppercase;
401 |   letter-spacing: 0.5px;
402 |   margin-bottom: var(--spacing-md);
403 | }
404 | 
405 | .annotation-severity.severity-critical {
406 |   background: rgba(239, 68, 68, 0.15);
407 |   color: var(--severity-critical);
408 |   border-left: 4px solid var(--severity-critical);
409 | }
410 | 
411 | .annotation-severity.severity-major {
412 |   background: rgba(249, 115, 22, 0.15);
413 |   color: var(--severity-major);
414 |   border-left: 4px solid var(--severity-major);
415 | }
416 | 
417 | .annotation-severity.severity-minor {
418 |   background: rgba(234, 179, 8, 0.15);
419 |   color: var(--severity-minor);
420 |   border-left: 4px solid var(--severity-minor);
421 | }
422 | 
423 | .annotation-severity.severity-info {
424 |   background: rgba(59, 130, 246, 0.15);
425 |   color: var(--severity-info);
426 |   border-left: 4px solid var(--severity-info);
427 | }
428 | 
429 | .annotation-message {
430 |   font-size: 1rem;
431 |   line-height: 1.6;
432 |   color: var(--text-primary);
433 | }
434 | 
435 | /* ============================================================================
436 |    CAPTION BAR
437 |    ============================================================================ */
438 | 
439 | .caption-bar {
440 |   flex-shrink: 0;
441 |   padding: var(--spacing-lg);
442 |   background: var(--bg-secondary);
443 |   border-top: 1px solid var(--bg-tertiary);
444 |   border-bottom: 1px solid var(--bg-tertiary);
445 | }
446 | 
447 | .caption-bar p {
448 |   max-width: 1200px;
449 |   margin: 0 auto;
450 |   font-size: 1.1rem;
451 |   line-height: 1.8;
452 |   color: var(--text-primary);
453 |   text-align: center;
454 | }
455 | 
456 | /* ============================================================================
457 |    PLAYER CONTROLS
458 |    ============================================================================ */
459 | 
460 | .player-controls {
461 |   flex-shrink: 0;
462 |   padding: var(--spacing-lg);
463 |   background: var(--bg-secondary);
464 |   border-top: 1px solid var(--bg-tertiary);
465 |   display: flex;
466 |   align-items: center;
467 |   gap: var(--spacing-lg);
468 | }
469 | 
470 | .controls-left,
471 | .controls-right {
472 |   display: flex;
473 |   gap: var(--spacing-sm);
474 | }
475 | 
476 | .controls-center {
477 |   flex: 1;
478 |   display: flex;
479 |   align-items: center;
480 |   gap: var(--spacing-md);
481 | }
482 | 
483 | .control-btn {
484 |   background: var(--bg-tertiary);
485 |   border: 1px solid var(--bg-tertiary);
486 |   color: var(--text-primary);
487 |   padding: 0.75rem 1rem;
488 |   border-radius: 8px;
489 |   font-size: 1rem;
490 |   cursor: pointer;
491 |   transition: background 0.2s, border-color 0.2s;
492 | }
493 | 
494 | .control-btn:hover {
495 |   background: #58a6ff;
496 |   border-color: #58a6ff;
497 |   color: white;
498 | }
499 | 
500 | .control-btn:active {
501 |   transform: scale(0.95);
502 | }
503 | 
504 | .scene-indicator {
505 |   font-family: var(--font-mono);
506 |   font-size: 0.9rem;
507 |   color: var(--text-secondary);
508 |   white-space: nowrap;
509 | }
510 | 
511 | .progress-bar {
512 |   flex: 1;
513 |   height: 6px;
514 |   background: var(--bg-tertiary);
515 |   border-radius: 3px;
516 |   overflow: hidden;
517 | }
518 | 
519 | .progress-fill {
520 |   height: 100%;
521 |   background: linear-gradient(90deg, #58a6ff 0%, #a371f7 100%);
522 |   transition: width 0.3s ease;
523 |   border-radius: 3px;
524 | }
525 | 
526 | /* ============================================================================
527 |    RESPONSIVE
528 |    ============================================================================ */
529 | 
530 | @media (max-width: 1280px) {
531 |   .player-main {
532 |     grid-template-columns: 1fr 350px;
533 |   }
534 | }
535 | 
536 | @media (max-width: 1024px) {
537 |   .player-main {
538 |     grid-template-columns: 1fr;
539 |   }
540 |   
541 |   .annotation-panel {
542 |     display: none;
543 |   }
544 | }
545 | 
546 | /* ============================================================================
547 |    PRISM THEME OVERRIDES
548 |    ============================================================================ */
549 | 
550 | code[class*="language-"],
551 | pre[class*="language-"] {
552 |   color: var(--text-primary);
553 |   background: var(--bg-secondary);
554 |   text-shadow: none;
555 | }
556 | 
557 | .token.comment,
558 | .token.prolog,
559 | .token.doctype,
560 | .token.cdata {
561 |   color: var(--text-muted);
562 | }
563 | 
564 | .token.punctuation {
565 |   color: var(--text-secondary);
566 | }
567 | 
568 | .token.property,
569 | .token.tag,
570 | .token.boolean,
571 | .token.number,
572 | .token.constant,
573 | .token.symbol,
574 | .token.deleted {
575 |   color: #ff7b72;
576 | }
577 | 
578 | .token.selector,
579 | .token.attr-name,
580 | .token.string,
581 | .token.char,
582 | .token.builtin,
583 | .token.inserted {
584 |   color: #a5d6ff;
585 | }
586 | 
587 | .token.operator,
588 | .token.entity,
589 | .token.url,
590 | .language-css .token.string,
591 | .style .token.string {
592 |   color: #79c0ff;
593 | }
594 | 
595 | .token.atrule,
596 | .token.attr-value,
597 | .token.keyword {
598 |   color: #ff7b72;
599 | }
600 | 
601 | .token.function,
602 | .token.class-name {
603 |   color: #d2a8ff;
604 | }
605 | 
606 | .token.regex,
607 | .token.important,
608 | .token.variable {
609 |   color: #ffa657;
610 | }
611 | 
612 | /* ============================================================================
613 |    Made with IBM Bob Code mode
614 |    ============================================================================ */
615 | 
616 | /* Made with Bob */
</content>
</file>
<file><path>viewer/viewer.js</path>
<content lines="1-644">
  1 | // Bob Council Viewer - Narrated code review walkthroughs
  2 | // Built with IBM Bob Code mode
  3 | 
  4 | // ============================================================================
  5 | // STATE MANAGEMENT
  6 | // ============================================================================
  7 | 
  8 | const state = {
  9 |   prSlug: null,
 10 |   script: null,
 11 |   parsedDiff: null,
 12 |   verdict: null,
 13 |   currentSceneIndex: 0,
 14 |   isPlaying: false,
 15 |   utterance: null,
 16 |   safetyTimeout: null,
 17 |   suppressOnEnd: false  // Made with Bob - guard against double-advance on manual navigation
 18 | };
 19 | 
 20 | // ============================================================================
 21 | // INITIALIZATION
 22 | // ============================================================================
 23 | 
 24 | document.addEventListener('DOMContentLoaded', () => {
 25 |   const urlParams = new URLSearchParams(window.location.search);
 26 |   const prSlug = urlParams.get('pr');
 27 |   
 28 |   if (prSlug) {
 29 |     // Player mode
 30 |     state.prSlug = prSlug;
 31 |     showPlayer();
 32 |     loadWalkthrough(prSlug);
 33 |   } else {
 34 |     // Landing page mode
 35 |     showLandingPage();
 36 |     loadWalkthroughsList();
 37 |   }
 38 | });
 39 | 
 40 | // ============================================================================
 41 | // LANDING PAGE
 42 | // ============================================================================
 43 | 
 44 | function showLandingPage() {
 45 |   document.getElementById('landing-page').style.display = 'block';
 46 |   document.getElementById('player').style.display = 'none';
 47 | }
 48 | 
 49 | async function loadWalkthroughsList() {
 50 |   const walkthroughs = [
 51 |     'pr-1-auth-bug',
 52 |     'pr-2-perf-regression',
 53 |     'pr-3-a11y-miss'
 54 |   ];
 55 |   
 56 |   const grid = document.getElementById('walkthroughs-grid');
 57 |   grid.innerHTML = '';
 58 |   
 59 |   for (const slug of walkthroughs) {
 60 |     try {
 61 |       const meta = await fetchJSON(`../samples/${slug}/meta.json`);
 62 |       const verdict = await fetchText(`../samples/${slug}/verdict.md`);
 63 |       
 64 |       const card = createWalkthroughCard(slug, meta, verdict);
 65 |       grid.appendChild(card);
 66 |     } catch (err) {
 67 |       console.error(`Failed to load walkthrough ${slug}:`, err);
 68 |     }
 69 |   }
 70 | }
 71 | 
 72 | function createWalkthroughCard(slug, meta, verdictText) {
 73 |   const card = document.createElement('div');
 74 |   card.className = 'walkthrough-card';
 75 |   
 76 |   // Parse verdict
 77 |   const voteTally = parseVoteTally(verdictText);
 78 |   const recommendation = parseRecommendation(verdictText);
 79 |   
 80 |   card.innerHTML = `
 81 |     <div class="card-header">
 82 |       <h3>${meta.title}</h3>
 83 |       <span class="verdict-badge verdict-${recommendation.toLowerCase()}">${recommendation}</span>
 84 |     </div>
 85 |     <p class="card-description">${meta.description}</p>
 86 |     <div class="card-votes">${voteTally}</div>
 87 |     <a href="?pr=${slug}" class="card-button">▶ Play walkthrough</a>
 88 |   `;
 89 |   
 90 |   return card;
 91 | }
 92 | 
 93 | // ============================================================================
 94 | // PLAYER
 95 | // ============================================================================
 96 | 
 97 | function showPlayer() {
 98 |   document.getElementById('landing-page').style.display = 'none';
 99 |   document.getElementById('player').style.display = 'flex';
100 |   
101 |   // Attach event listeners
102 |   document.getElementById('btn-play').addEventListener('click', play);
103 |   document.getElementById('btn-pause').addEventListener('click', pause);
104 |   document.getElementById('btn-prev').addEventListener('click', previousScene);
105 |   document.getElementById('btn-next').addEventListener('click', nextScene);
106 | }
107 | 
108 | async function loadWalkthrough(slug) {
109 |   try {
110 |     // Load script, diff, and verdict in parallel
111 |     const [rawScript, diffText, verdictText] = await Promise.all([
112 |       fetchJSON(`samples/${slug}/script.json`),
113 |       fetchText(`../samples/${slug}/pr.diff`),
114 |       fetchText(`../samples/${slug}/verdict.md`)
115 |     ]);
116 |     
117 |     // Normalize script schema (handles both rich and simple formats)
118 |     state.script = normalizeScript(rawScript);
119 |     state.parsedDiff = parseDiff(diffText);
120 |     state.verdict = {
121 |       recommendation: parseRecommendation(verdictText),
122 |       voteTally: parseVoteTally(verdictText),
123 |       contentiousness: parseContentiousness(verdictText)
124 |     };
125 |     
126 |     // Update header
127 |     document.getElementById('pr-title').textContent = state.script.title;
128 |     updateVerdictPill();
129 |     updateVoteTally();
130 |     
131 |     // Load first scene
132 |     state.currentSceneIndex = 0;
133 |     renderScene(0);
134 |     
135 |   } catch (err) {
136 |     console.error('Failed to load walkthrough:', err);
137 |     alert('Failed to load walkthrough. Check console for details.');
138 |   }
139 | }
140 | 
141 | // ============================================================================
142 | // SCRIPT NORMALIZATION
143 | // ============================================================================
144 | 
145 | function normalizeScript(raw) {
146 |   if (raw.scenes) {
147 |     // Rich schema — already in target shape
148 |     return {
149 |       title: raw.title,
150 |       prContext: raw.prContext,
151 |       scenes: raw.scenes.map(s => ({
152 |         narration: s.narration,
153 |         file: s.code.file,
154 |         startLine: s.code.startLine,
155 |         endLine: s.code.endLine,
156 |         highlight: s.code.highlight || [],
157 |         annotation: s.annotation || null
158 |       }))
159 |     };
160 |   }
161 |   if (raw.segments) {
162 |     // Simple schema — synthesize defaults
163 |     return {
164 |       title: raw.title,
165 |       prContext: null,
166 |       scenes: raw.segments.map(s => ({
167 |         narration: s.narration,
168 |         file: s.file,
169 |         startLine: s.startLine,
170 |         endLine: s.endLine,
171 |         highlight: [],          // no per-line highlight in simple schema
172 |         annotation: null         // no annotation in simple schema
173 |       }))
174 |     };
175 |   }
176 |   throw new Error("Unrecognized script.json schema — expected either 'scenes' or 'segments'");
177 | }
178 | 
179 | // ============================================================================
180 | // DIFF PARSING
181 | // ============================================================================
182 | 
183 | function parseDiff(diffText) {
184 |   const files = new Map();
185 |   const lines = diffText.split('\n');
186 |   let currentFile = null;
187 |   let currentLines = [];
188 |   let afterLineNum = 0;
189 |   
190 |   for (let i = 0; i < lines.length; i++) {
191 |     const line = lines[i];
192 |     
193 |     // File header: +++ b/path/to/file or +++ /dev/null
194 |     if (line.startsWith('+++ ')) {
195 |       if (currentFile) {
196 |         files.set(currentFile, currentLines);
197 |       }
198 |       // Extract filename and normalize (remove a/ or b/ prefix)
199 |       let filename = line.substring(4).trim(); // Remove '+++ '
200 |       if (filename.startsWith('b/')) {
201 |         filename = filename.substring(2); // Remove 'b/'
202 |       } else if (filename === '/dev/null') {
203 |         filename = null; // New file will be set from --- line
204 |       }
205 |       currentFile = filename;
206 |       currentLines = [];
207 |       afterLineNum = 0;
208 |       continue;
209 |     }
210 |     
211 |     // Handle new files: --- /dev/null means the +++ line has the real filename
212 |     if (line.startsWith('--- /dev/null')) {
213 |       // Next line will be +++ b/filename
214 |       continue;
215 |     }
216 |     
217 |     // Hunk header: @@ -A,B +C,D @@
218 |     if (line.startsWith('@@')) {
219 |       const match = line.match(/\+(\d+)/);
220 |       if (match) {
221 |         afterLineNum = parseInt(match[1], 10);
222 |       }
223 |       continue;
224 |     }
225 |     
226 |     // Skip file headers
227 |     if (line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')) {
228 |       continue;
229 |     }
230 |     
231 |     // Content lines - store with real line numbers
232 |     if (currentFile !== null && afterLineNum > 0) {
233 |       if (line.startsWith('-')) {
234 |         // Removed line - skip in AFTER state, don't increment line number
235 |         continue;
236 |       } else if (line.startsWith('+')) {
237 |         // Added line
238 |         currentLines.push({
239 |           lineNumber: afterLineNum,
240 |           text: line.substring(1), // Remove '+'
241 |           isAdded: true
242 |         });
243 |         afterLineNum++;
244 |       } else if (line.startsWith(' ')) {
245 |         // Context line (kept)
246 |         currentLines.push({
247 |           lineNumber: afterLineNum,
248 |           text: line.substring(1), // Remove leading space
249 |           isAdded: false
250 |         });
251 |         afterLineNum++;
252 |       }
253 |     }
254 |   }
255 |   
256 |   // Save last file
257 |   if (currentFile) {
258 |     files.set(currentFile, currentLines);
259 |   }
260 |   
261 |   return files;
262 | }
263 | 
264 | // ============================================================================
265 | // SCENE RENDERING
266 | // ============================================================================
267 | 
268 | function renderScene(index) {
269 |   const scene = state.script.scenes[index];
270 |   if (!scene) return;
271 |   
272 |   // Update scene indicator
273 |   document.getElementById('scene-indicator').textContent =
274 |     `${index + 1} / ${state.script.scenes.length}`;
275 |   
276 |   // Update progress bar
277 |   const progress = ((index + 1) / state.script.scenes.length) * 100;
278 |   document.getElementById('progress-fill').style.width = `${progress}%`;
279 |   
280 |   // Update caption
281 |   document.getElementById('caption-text').textContent = scene.narration;
282 |   
283 |   // Update annotation panel
284 |   const annotationPanel = document.getElementById('annotation-panel');
285 |   if (scene.annotation) {
286 |     annotationPanel.style.display = 'flex';
287 |     document.getElementById('annotation-severity').textContent =
288 |       scene.annotation.severity.toUpperCase();
289 |     document.getElementById('annotation-severity').className =
290 |       `annotation-severity severity-${scene.annotation.severity}`;
291 |     document.getElementById('annotation-message').textContent =
292 |       scene.annotation.message;
293 |   } else {
294 |     // Hide annotation panel for simple schema scenes
295 |     annotationPanel.style.display = 'none';
296 |   }
297 |   
298 |   // Update code panel
299 |   renderCode(scene);
300 | }
301 | 
302 | function renderCode(scene) {
303 |   const { file, startLine, endLine, highlight } = scene.code || scene;
304 |   
305 |   // Update file name
306 |   document.getElementById('file-name').textContent = file;
307 |   
308 |   // Get file content from parsed diff
309 |   const fileLines = state.parsedDiff.get(file);
310 |   if (!fileLines) {
311 |     console.error(`File not found in diff: ${file}`);
312 |     return;
313 |   }
314 |   
315 |   // Filter lines within the requested range
316 |   const relevantLines = fileLines.filter(
317 |     line => line.lineNumber >= startLine && line.lineNumber <= endLine
318 |   );
319 |   
320 |   if (relevantLines.length === 0) {
321 |     console.warn(`No lines found in range ${startLine}-${endLine} for ${file}`);
322 |     return;
323 |   }
324 |   
325 |   // Build code text
326 |   const codeText = relevantLines.map(line => line.text).join('\n');
327 |   
328 |   // Detect language from file extension
329 |   const language = detectLanguage(file);
330 |   
331 |   // Update code element
332 |   const codeElement = document.getElementById('code-content');
333 |   codeElement.textContent = codeText;
334 |   codeElement.className = `language-${language}`;
335 |   
336 |   // Store line mapping for highlighting
337 |   codeElement.dataset.lineMapping = JSON.stringify(
338 |     relevantLines.map(line => line.lineNumber)
339 |   );
340 |   codeElement.dataset.highlights = JSON.stringify(highlight || []);
341 |   
342 |   // Set data-start attribute for correct line numbering in gutter
343 |   const preElement = codeElement.parentElement;
344 |   preElement.setAttribute('data-start', String(relevantLines[0].lineNumber));
345 |   
346 |   // Made with Bob - Set data-line for Prism line-highlight plugin
347 |   const severity = scene.annotation ? scene.annotation.severity : 'info';
348 |   preElement.setAttribute('data-severity', severity);
349 |   
350 |   if (highlight && highlight.length > 0) {
351 |     // Convert highlight array to data-line format
352 |     const dataLine = formatDataLine(highlight);
353 |     preElement.setAttribute('data-line', dataLine);
354 |   } else {
355 |     preElement.removeAttribute('data-line');
356 |   }
357 |   
358 |   // Apply syntax highlighting (line-highlight plugin auto-runs)
359 |   Prism.highlightElement(codeElement);
360 |   
361 |   // Fade in effect
362 |   const codePanel = document.getElementById('code-panel');
363 |   codePanel.style.opacity = '0';
364 |   setTimeout(() => {
365 |     codePanel.style.opacity = '1';
366 |   }, 50);
367 | }
368 | 
369 | // Made with Bob - Format highlight array for Prism data-line attribute
370 | function formatDataLine(highlightArray) {
371 |   if (!highlightArray || highlightArray.length === 0) return '';
372 |   
373 |   // Sort the array
374 |   const sorted = [...highlightArray].sort((a, b) => a - b);
375 |   
376 |   // Group consecutive numbers into ranges
377 |   const ranges = [];
378 |   let start = sorted[0];
379 |   let end = sorted[0];
380 |   
381 |   for (let i = 1; i <= sorted.length; i++) {
382 |     if (i < sorted.length && sorted[i] === end + 1) {
383 |       end = sorted[i];
384 |     } else {
385 |       if (start === end) {
386 |         ranges.push(String(start));
387 |       } else {
388 |         ranges.push(`${start}-${end}`);
389 |       }
390 |       if (i < sorted.length) {
391 |         start = sorted[i];
392 |         end = sorted[i];
393 |       }
394 |     }
395 |   }
396 |   
397 |   return ranges.join(',');
398 | }
399 | 
400 | function detectLanguage(filename) {
401 |   const ext = filename.split('.').pop().toLowerCase();
402 |   const langMap = {
403 |     'js': 'javascript',
404 |     'jsx': 'javascript',
405 |     'ts': 'javascript',
406 |     'tsx': 'javascript',
407 |     'html': 'markup',
408 |     'htm': 'markup',
409 |     'xml': 'markup',
410 |     'css': 'css',
411 |     'scss': 'css',
412 |     'json': 'json'
413 |   };
414 |   return langMap[ext] || 'javascript';
415 | }
416 | 
417 | // Made with Bob - Removed custom highlight functions, now using Prism's line-highlight plugin
418 | 
419 | // ============================================================================
420 | // PLAYBACK CONTROLS
421 | // ============================================================================
422 | 
423 | function play() {
424 |   if (state.isPlaying) return;
425 |   
426 |   state.isPlaying = true;
427 |   document.getElementById('btn-play').style.display = 'none';
428 |   document.getElementById('btn-pause').style.display = 'inline-block';
429 |   
430 |   speakCurrentScene();
431 | }
432 | 
433 | function pause() {
434 |   if (!state.isPlaying) return;
435 |   
436 |   state.isPlaying = false;
437 |   document.getElementById('btn-play').style.display = 'inline-block';
438 |   document.getElementById('btn-pause').style.display = 'none';
439 |   
440 |   // Cancel speech and clear safety timeout
441 |   speechSynthesis.cancel();
442 |   if (state.safetyTimeout) {
443 |     clearTimeout(state.safetyTimeout);
444 |     state.safetyTimeout = null;
445 |   }
446 | }
447 | 
448 | function previousScene() {
449 |   // Made with Bob - guard against double-advance
450 |   state.suppressOnEnd = true;
451 |   
452 |   // Cancel current narration and timeout
453 |   speechSynthesis.cancel();
454 |   if (state.safetyTimeout) {
455 |     clearTimeout(state.safetyTimeout);
456 |     state.safetyTimeout = null;
457 |   }
458 |   
459 |   if (state.currentSceneIndex > 0) {
460 |     state.currentSceneIndex--;
461 |     renderScene(state.currentSceneIndex);
462 |     
463 |     if (state.isPlaying) {
464 |       speakCurrentScene();
465 |     }
466 |   }
467 | }
468 | 
469 | function nextScene() {
470 |   // Made with Bob - guard against double-advance
471 |   state.suppressOnEnd = true;
472 |   
473 |   // Cancel current narration and timeout
474 |   speechSynthesis.cancel();
475 |   if (state.safetyTimeout) {
476 |     clearTimeout(state.safetyTimeout);
477 |     state.safetyTimeout = null;
478 |   }
479 |   
480 |   if (state.currentSceneIndex < state.script.scenes.length - 1) {
481 |     state.currentSceneIndex++;
482 |     renderScene(state.currentSceneIndex);
483 |     
484 |     if (state.isPlaying) {
485 |       speakCurrentScene();
486 |     }
487 |   } else {
488 |     // End of walkthrough
489 |     pause();
490 |   }
491 | }
492 | 
493 | function advanceToNextScene() {
494 |   // Made with Bob - check suppressOnEnd guard
495 |   if (state.suppressOnEnd) {
496 |     state.suppressOnEnd = false;
497 |     return;
498 |   }
499 |   
500 |   // Clear safety timeout since we're advancing
501 |   if (state.safetyTimeout) {
502 |     clearTimeout(state.safetyTimeout);
503 |     state.safetyTimeout = null;
504 |   }
505 |   
506 |   if (!state.isPlaying) return;
507 |   
508 |   if (state.currentSceneIndex < state.script.scenes.length - 1) {
509 |     state.currentSceneIndex++;
510 |     renderScene(state.currentSceneIndex);
511 |     speakCurrentScene();
512 |   } else {
513 |     // End of walkthrough
514 |     pause();
515 |   }
516 | }
517 | 
518 | function speakCurrentScene() {
519 |   const scene = state.script.scenes[state.currentSceneIndex];
520 |   if (!scene) return;
521 |   
522 |   // Made with Bob - reset suppressOnEnd when starting new utterance
523 |   state.suppressOnEnd = false;
524 |   
525 |   const utterance = new SpeechSynthesisUtterance(scene.narration);
526 |   utterance.rate = 1.0;
527 |   utterance.pitch = 1.0;
528 |   
529 |   // Estimate duration: 80ms per character, minimum 3 seconds
530 |   const estimatedDuration = Math.max(3000, scene.narration.length * 80);
531 |   
532 |   // Made with Bob - Trigger animated highlights when speech starts
533 |   utterance.onstart = () => {
534 |     triggerAnimatedHighlights(scene);
535 |   };
536 |   
537 |   const advanceHandler = () => {
538 |     advanceToNextScene();
539 |   };
540 |   
541 |   utterance.onend = advanceHandler;
542 |   utterance.onerror = (err) => {
543 |     console.error('Speech synthesis error:', err);
544 |     advanceHandler(); // Still advance on error
545 |   };
546 |   
547 |   state.utterance = utterance;
548 |   
549 |   // Set safety timeout in case onend doesn't fire
550 |   state.safetyTimeout = setTimeout(advanceHandler, estimatedDuration + 1000);
551 |   
552 |   try {
553 |     speechSynthesis.speak(utterance);
554 |   } catch (err) {
555 |     console.error('Failed to speak:', err);
556 |     advanceHandler();
557 |   }
558 | }
559 | 
560 | function triggerAnimatedHighlights(scene) {
561 |   // Made with Bob - Trigger animation on Prism line-highlight elements
562 |   const codeData = scene.code || scene;
563 |   const highlightLines = codeData.highlight || [];
564 |   
565 |   if (highlightLines.length === 0) return;
566 |   
567 |   // Calculate animation duration based on narration length
568 |   const narrationLength = scene.narration ? scene.narration.length : 0;
569 |   const durationMs = Math.max(1500, Math.min(narrationLength * 60, 8000));
570 |   
571 |   // Wait for Prism line-highlight plugin to render
572 |   setTimeout(() => {
573 |     const lineHighlightElements = document.querySelectorAll('.line-highlight');
574 |     
575 |     lineHighlightElements.forEach(element => {
576 |       element.style.setProperty('--highlight-duration', durationMs + 'ms');
577 |       element.classList.add('animate-in');
578 |       
579 |       // Force reflow to restart animation
580 |       void element.offsetWidth;
581 |     });
582 |   }, 150);
583 | }
584 | // End Made with Bob
585 | 
586 | // ============================================================================
587 | // VERDICT PARSING
588 | // ============================================================================
589 | 
590 | function parseVoteTally(verdictText) {
591 |   const match = verdictText.match(/\*\*Vote tally:\*\* (.+)/);
592 |   return match ? match[1] : '👍 0 · 👎 0 · 🤔 0';
593 | }
594 | 
595 | function parseRecommendation(verdictText) {
596 |   const match = verdictText.match(/\*\*Recommendation:\*\* (\w+)/);
597 |   return match ? match[1] : 'UNKNOWN';
598 | }
599 | 
600 | function parseContentiousness(verdictText) {
601 |   const match = verdictText.match(/\*\*Contentiousness score:\*\* ([\d.]+)/);
602 |   return match ? match[1] : 'N/A';
603 | }
604 | 
605 | function updateVerdictPill() {
606 |   const pill = document.getElementById('verdict-pill');
607 |   const rec = state.verdict.recommendation;
608 |   pill.textContent = rec;
609 |   pill.className = `verdict-pill verdict-${rec.toLowerCase()}`;
610 | }
611 | 
612 | function updateVoteTally() {
613 |   const tally = document.getElementById('vote-tally');
614 |   tally.innerHTML = `
615 |     ${state.verdict.voteTally}
616 |     <span class="contentiousness">• Contentiousness: ${state.verdict.contentiousness}</span>
617 |   `;
618 | }
619 | 
620 | // ============================================================================
621 | // UTILITIES
622 | // ============================================================================
623 | 
624 | async function fetchJSON(url) {
625 |   const response = await fetch(url);
626 |   if (!response.ok) {
627 |     throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
628 |   }
629 |   return response.json();
630 | }
631 | 
632 | async function fetchText(url) {
633 |   const response = await fetch(url);
634 |   if (!response.ok) {
635 |     throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
636 |   }
637 |   return response.text();
638 | }
639 | 
640 | // ============================================================================
641 | // Made with IBM Bob Code mode
642 | // ============================================================================
643 | 
644 | // Made with Bob
</content>
</file>
</files>
<environment_details>
# VSCode Visible Files
viewer\viewer.css

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/index.html,viewer/viewer.js,viewer/viewer.css,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:21.357Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.01

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps.
</environment_details>

---

**Assistant:**

I'll now remove all the code-row highlight feature components. Let me start by creating a todo list and then systematically remove the highlight-related code.

<update_todo_list>
<todos>
[ ] Remove Prism line-highlight CSS and JS from viewer/index.html
[ ] Remove line-highlight styling from viewer/viewer.css
[ ] Remove highlight logic from viewer/viewer.js
</todos>
</update_todo_list>

---

**User:**

[update_todo_list] Result:
Todo list updated successfully.
<environment_details>
# VSCode Visible Files
viewer\viewer.css

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/index.html,viewer/viewer.js,viewer/viewer.css,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:26.314Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.06

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Pending |
| 2 | Remove line-highlight styling from viewer/viewer.css | Pending |
| 3 | Remove highlight logic from viewer/viewer.js | Pending |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

Now I'll remove the Prism line-highlight plugin references from viewer/index.html.

<apply_diff>
<path>viewer/index.html</path>
<diff>
<<<<<<< SEARCH
:start_line:13
-------
  <!-- Prism.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.min.css">
=======
  <!-- Prism.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css">
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:91
-------
  <!-- Prism.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/plugins/line-highlight/prism-line-highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
=======
  <!-- Prism.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
>>>>>>> REPLACE
</diff>
</apply_diff>

---

**User:**

[apply_diff for 'viewer/index.html'] Result:
<file_write_result>
<path>viewer/index.html</path>
<operation>modified</operation>
<notice>
<i>You do not need to re-read the file, as you have seen all changes</i>
<i>Proceed with the task using these changes as the new baseline.</i>
</notice>
</file_write_result>

<environment_details>
# VSCode Visible Files
viewer\index.html

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/viewer.js,viewer/viewer.css,viewer/index.html,viewer/samples/pr-2-perf-regression/script.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
viewer/index.html

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:36.475Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.11

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Pending |
| 2 | Remove line-highlight styling from viewer/viewer.css | Pending |
| 3 | Remove highlight logic from viewer/viewer.js | Pending |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

<update_todo_list>
<todos>
[x] Remove Prism line-highlight CSS and JS from viewer/index.html
[-] Remove line-highlight styling from viewer/viewer.css
[ ] Remove highlight logic from viewer/viewer.js
</todos>
</update_todo_list>

---

**User:**

[update_todo_list] Result:
Todo list updated successfully.
<environment_details>
# VSCode Visible Files
viewer\index.html

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/viewer.js,viewer/viewer.css,viewer/index.html,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:39.829Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.17

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Completed |
| 2 | Remove line-highlight styling from viewer/viewer.css | In Progress |
| 3 | Remove highlight logic from viewer/viewer.js | Pending |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

Now I'll remove all the line-highlight styling from viewer/viewer.css.

<apply_diff>
<path>viewer/viewer.css</path>
<diff>
<<<<<<< SEARCH
:start_line:342
-------
/* Made with Bob - Prism line-highlight plugin styling with severity colors */
/* Default critical severity - red highlight */
.line-highlight {
  background: rgba(239, 68, 68, 0.30) !important;
  border-left: 4px solid #ef4444 !important;
  --highlight-duration: 2.5s;
}

/* Non-critical severities - yellow highlight */
pre[data-severity="major"] .line-highlight,
pre[data-severity="minor"] .line-highlight,
pre[data-severity="info"] .line-highlight {
  background: rgba(234, 179, 8, 0.30) !important;
  border-left-color: #eab308 !important;
}

/* Karaoke animation */
.line-highlight.animate-in {
  animation: line-highlight-sweep var(--highlight-duration) ease-out forwards;
}

@keyframes line-highlight-sweep {
  0% {
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left;
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}
/* End Made with Bob */

=======
>>>>>>> REPLACE
</diff>
</apply_diff>

---

**User:**

[apply_diff for 'viewer/viewer.css'] Result:
<file_write_result>
<path>viewer/viewer.css</path>
<operation>modified</operation>
<notice>
<i>You do not need to re-read the file, as you have seen all changes</i>
<i>Proceed with the task using these changes as the new baseline.</i>
</notice>
</file_write_result>

<notice>Making multiple related changes in a single apply_diff is more efficient. If other changes are needed in this file, please include them as additional SEARCH/REPLACE blocks.</notice>
<environment_details>
# VSCode Visible Files
viewer\viewer.css

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/viewer.js,viewer/index.html,viewer/viewer.css,viewer/samples/pr-2-perf-regression/script.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
viewer/viewer.css

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:48.150Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.23

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Completed |
| 2 | Remove line-highlight styling from viewer/viewer.css | In Progress |
| 3 | Remove highlight logic from viewer/viewer.js | Pending |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

<update_todo_list>
<todos>
[x] Remove Prism line-highlight CSS and JS from viewer/index.html
[x] Remove line-highlight styling from viewer/viewer.css
[-] Remove highlight logic from viewer/viewer.js
</todos>
</update_todo_list>

---

**User:**

[update_todo_list] Result:
Todo list updated successfully.
<environment_details>
# VSCode Visible Files
viewer\viewer.css

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/viewer.js,viewer/index.html,viewer/viewer.css,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:02:51.602Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.28

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Completed |
| 2 | Remove line-highlight styling from viewer/viewer.css | Completed |
| 3 | Remove highlight logic from viewer/viewer.js | In Progress |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

Now I'll remove all the highlight logic from viewer/viewer.js. This includes the data-line attribute setting, data-severity attribute, formatDataLine function, triggerAnimatedHighlights function, and the utterance.onstart hook.

<apply_diff>
<path>viewer/viewer.js</path>
<diff>
<<<<<<< SEARCH
:start_line:302
-------
function renderCode(scene) {
  const { file, startLine, endLine, highlight } = scene.code || scene;
  
  // Update file name
  document.getElementById('file-name').textContent = file;
  
  // Get file content from parsed diff
  const fileLines = state.parsedDiff.get(file);
  if (!fileLines) {
    console.error(`File not found in diff: ${file}`);
    return;
  }
  
  // Filter lines within the requested range
  const relevantLines = fileLines.filter(
    line => line.lineNumber >= startLine && line.lineNumber <= endLine
  );
  
  if (relevantLines.length === 0) {
    console.warn(`No lines found in range ${startLine}-${endLine} for ${file}`);
    return;
  }
  
  // Build code text
  const codeText = relevantLines.map(line => line.text).join('\n');
  
  // Detect language from file extension
  const language = detectLanguage(file);
  
  // Update code element
  const codeElement = document.getElementById('code-content');
  codeElement.textContent = codeText;
  codeElement.className = `language-${language}`;
  
  // Store line mapping for highlighting
  codeElement.dataset.lineMapping = JSON.stringify(
    relevantLines.map(line => line.lineNumber)
  );
  codeElement.dataset.highlights = JSON.stringify(highlight || []);
  
  // Set data-start attribute for correct line numbering in gutter
  const preElement = codeElement.parentElement;
  preElement.setAttribute('data-start', String(relevantLines[0].lineNumber));
  
  // Made with Bob - Set data-line for Prism line-highlight plugin
  const severity = scene.annotation ? scene.annotation.severity : 'info';
  preElement.setAttribute('data-severity', severity);
  
  if (highlight && highlight.length > 0) {
    // Convert highlight array to data-line format
    const dataLine = formatDataLine(highlight);
    preElement.setAttribute('data-line', dataLine);
  } else {
    preElement.removeAttribute('data-line');
  }
  
  // Apply syntax highlighting (line-highlight plugin auto-runs)
  Prism.highlightElement(codeElement);
  
  // Fade in effect
  const codePanel = document.getElementById('code-panel');
  codePanel.style.opacity = '0';
  setTimeout(() => {
    codePanel.style.opacity = '1';
  }, 50);
}
=======
function renderCode(scene) {
  const { file, startLine, endLine } = scene.code || scene;
  
  // Update file name
  document.getElementById('file-name').textContent = file;
  
  // Get file content from parsed diff
  const fileLines = state.parsedDiff.get(file);
  if (!fileLines) {
    console.error(`File not found in diff: ${file}`);
    return;
  }
  
  // Filter lines within the requested range
  const relevantLines = fileLines.filter(
    line => line.lineNumber >= startLine && line.lineNumber <= endLine
  );
  
  if (relevantLines.length === 0) {
    console.warn(`No lines found in range ${startLine}-${endLine} for ${file}`);
    return;
  }
  
  // Build code text
  const codeText = relevantLines.map(line => line.text).join('\n');
  
  // Detect language from file extension
  const language = detectLanguage(file);
  
  // Update code element
  const codeElement = document.getElementById('code-content');
  codeElement.textContent = codeText;
  codeElement.className = `language-${language}`;
  
  // Set data-start attribute for correct line numbering in gutter
  const preElement = codeElement.parentElement;
  preElement.setAttribute('data-start', String(relevantLines[0].lineNumber));
  
  // Apply syntax highlighting
  Prism.highlightElement(codeElement);
  
  // Fade in effect
  const codePanel = document.getElementById('code-panel');
  codePanel.style.opacity = '0';
  setTimeout(() => {
    codePanel.style.opacity = '1';
  }, 50);
}
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:369
-------
// Made with Bob - Format highlight array for Prism data-line attribute
function formatDataLine(highlightArray) {
  if (!highlightArray || highlightArray.length === 0) return '';
  
  // Sort the array
  const sorted = [...highlightArray].sort((a, b) => a - b);
  
  // Group consecutive numbers into ranges
  const ranges = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (start === end) {
        ranges.push(String(start));
      } else {
        ranges.push(`${start}-${end}`);
      }
      if (i < sorted.length) {
        start = sorted[i];
        end = sorted[i];
      }
    }
  }
  
  return ranges.join(',');
}

=======
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:415
-------
// Made with Bob - Removed custom highlight functions, now using Prism's line-highlight plugin

=======
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:525
-------
  const utterance = new SpeechSynthesisUtterance(scene.narration);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  // Estimate duration: 80ms per character, minimum 3 seconds
  const estimatedDuration = Math.max(3000, scene.narration.length * 80);
  
  // Made with Bob - Trigger animated highlights when speech starts
  utterance.onstart = () => {
    triggerAnimatedHighlights(scene);
  };
  
  const advanceHandler = () => {
=======
  const utterance = new SpeechSynthesisUtterance(scene.narration);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  // Estimate duration: 80ms per character, minimum 3 seconds
  const estimatedDuration = Math.max(3000, scene.narration.length * 80);
  
  const advanceHandler = () => {
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:560
-------
function triggerAnimatedHighlights(scene) {
  // Made with Bob - Trigger animation on Prism line-highlight elements
  const codeData = scene.code || scene;
  const highlightLines = codeData.highlight || [];
  
  if (highlightLines.length === 0) return;
  
  // Calculate animation duration based on narration length
  const narrationLength = scene.narration ? scene.narration.length : 0;
  const durationMs = Math.max(1500, Math.min(narrationLength * 60, 8000));
  
  // Wait for Prism line-highlight plugin to render
  setTimeout(() => {
    const lineHighlightElements = document.querySelectorAll('.line-highlight');
    
    lineHighlightElements.forEach(element => {
      element.style.setProperty('--highlight-duration', durationMs + 'ms');
      element.classList.add('animate-in');
      
      // Force reflow to restart animation
      void element.offsetWidth;
    });
  }, 150);
}
// End Made with Bob

=======
>>>>>>> REPLACE
</diff>
</apply_diff>

---

**User:**

[apply_diff for 'viewer/viewer.js'] Result:
<file_write_result>
<path>viewer/viewer.js</path>
<operation>modified</operation>
<notice>
<i>You do not need to re-read the file, as you have seen all changes</i>
<i>Proceed with the task using these changes as the new baseline.</i>
</notice>
</file_write_result>

<environment_details>
# VSCode Visible Files
viewer\viewer.js

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/index.html,viewer/viewer.css,viewer/viewer.js,viewer/samples/pr-2-perf-regression/script.json

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
viewer/viewer.js

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:03:19.219Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.35

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Completed |
| 2 | Remove line-highlight styling from viewer/viewer.css | Completed |
| 3 | Remove highlight logic from viewer/viewer.js | In Progress |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

<update_todo_list>
<todos>
[x] Remove Prism line-highlight CSS and JS from viewer/index.html
[x] Remove line-highlight styling from viewer/viewer.css
[x] Remove highlight logic from viewer/viewer.js
</todos>
</update_todo_list>

---

**User:**

[update_todo_list] Result:
Todo list updated successfully.
<environment_details>
# VSCode Visible Files
viewer\viewer.js

# VSCode Open Tabs
viewer/samples/pr-1-auth-bug/script.json,viewer/index.html,viewer/viewer.css,viewer/viewer.js,viewer/samples/pr-2-perf-regression/script.json

# Current Time
Current time in ISO 8601 UTC format: 2026-05-17T02:03:22.743Z
User time zone: Asia/Karachi, UTC+5:00

# Current Cost
$0.41

# Review Exclusions
The following file patterns are excluded from code reviews:
- .vscode/**

# Current Mode
<slug>code</slug>
<name>💻 Code</name>
====

REMINDERS

Below is your current list of reminders for this task. Keep them updated as you progress.

| # | Content | Status |
|---|---------|--------|
| 1 | Remove Prism line-highlight CSS and JS from viewer/index.html | Completed |
| 2 | Remove line-highlight styling from viewer/viewer.css | Completed |
| 3 | Remove highlight logic from viewer/viewer.js | Completed |


IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.

</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
Code-row highlight feature completely removed. Changes made:

**viewer/index.html** (2 lines removed):
- Deleted Prism line-highlight CSS `<link>` tag (line 16)
- Deleted Prism line-highlight JS `<script>` tag (line 94)

**viewer/viewer.css** (33 lines removed):
- Deleted `.line-highlight` styling with severity colors (lines 342-374)
- Deleted `@keyframes line-highlight-sweep` animation
- Deleted `pre[data-severity]` attribute selectors

**viewer/viewer.js** (52 lines removed):
- Removed `highlight` destructuring from `renderCode()` function
- Removed `data-line` attribute setting on `<pre>` element
- Removed `data-severity` attribute setting on `<pre>` element
- Removed `dataset.lineMapping` and `dataset.highlights` assignments
- Deleted `formatDataLine()` function (lines 369-398)
- Deleted `triggerAnimatedHighlights()` function (lines 560-583)
- Removed `utterance.onstart` hook that triggered highlight animations

**Preserved:**
- Prism line-numbers plugin (gutter line numbers with `data-start` logic)
- Severity pill in annotation panel (`.annotation-severity`)
- All playback controls and auto-advance logic
- Next-button single-advance guard (`suppressOnEnd`)
</result>
</attempt_completion>

