// Bob Council Viewer - Narrated code review walkthroughs
// Built with IBM Bob Code mode

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  prSlug: null,
  script: null,
  parsedDiff: null,
  verdict: null,
  currentSceneIndex: 0,
  isPlaying: false,
  utterance: null,
  safetyTimeout: null
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const prSlug = urlParams.get('pr');
  
  if (prSlug) {
    // Player mode
    state.prSlug = prSlug;
    showPlayer();
    loadWalkthrough(prSlug);
  } else {
    // Landing page mode
    showLandingPage();
    loadWalkthroughsList();
  }
});

// ============================================================================
// LANDING PAGE
// ============================================================================

function showLandingPage() {
  document.getElementById('landing-page').style.display = 'block';
  document.getElementById('player').style.display = 'none';
}

async function loadWalkthroughsList() {
  const walkthroughs = [
    'pr-1-auth-bug',
    'pr-2-perf-regression',
    'pr-3-a11y-miss'
  ];
  
  const grid = document.getElementById('walkthroughs-grid');
  grid.innerHTML = '';
  
  for (const slug of walkthroughs) {
    try {
      const meta = await fetchJSON(`../samples/${slug}/meta.json`);
      const verdict = await fetchText(`../samples/${slug}/verdict.md`);
      
      const card = createWalkthroughCard(slug, meta, verdict);
      grid.appendChild(card);
    } catch (err) {
      console.error(`Failed to load walkthrough ${slug}:`, err);
    }
  }
}

function createWalkthroughCard(slug, meta, verdictText) {
  const card = document.createElement('div');
  card.className = 'walkthrough-card';
  
  // Parse verdict
  const voteTally = parseVoteTally(verdictText);
  const recommendation = parseRecommendation(verdictText);
  
  card.innerHTML = `
    <div class="card-header">
      <h3>${meta.title}</h3>
      <span class="verdict-badge verdict-${recommendation.toLowerCase()}">${recommendation}</span>
    </div>
    <p class="card-description">${meta.description}</p>
    <div class="card-votes">${voteTally}</div>
    <a href="?pr=${slug}" class="card-button">▶ Play walkthrough</a>
  `;
  
  return card;
}

// ============================================================================
// PLAYER
// ============================================================================

function showPlayer() {
  document.getElementById('landing-page').style.display = 'none';
  document.getElementById('player').style.display = 'flex';
  
  // Attach event listeners
  document.getElementById('btn-play').addEventListener('click', play);
  document.getElementById('btn-pause').addEventListener('click', pause);
  document.getElementById('btn-prev').addEventListener('click', previousScene);
  document.getElementById('btn-next').addEventListener('click', nextScene);
}

async function loadWalkthrough(slug) {
  try {
    // Load script, diff, and verdict in parallel
    const [rawScript, diffText, verdictText] = await Promise.all([
      fetchJSON(`samples/${slug}/script.json`),
      fetchText(`../samples/${slug}/pr.diff`),
      fetchText(`../samples/${slug}/verdict.md`)
    ]);
    
    // Normalize script schema (handles both rich and simple formats)
    state.script = normalizeScript(rawScript);
    state.parsedDiff = parseDiff(diffText);
    state.verdict = {
      recommendation: parseRecommendation(verdictText),
      voteTally: parseVoteTally(verdictText),
      contentiousness: parseContentiousness(verdictText)
    };
    
    // Update header
    document.getElementById('pr-title').textContent = state.script.title;
    updateVerdictPill();
    updateVoteTally();
    
    // Load first scene
    state.currentSceneIndex = 0;
    renderScene(0);
    
  } catch (err) {
    console.error('Failed to load walkthrough:', err);
    alert('Failed to load walkthrough. Check console for details.');
  }
}

// ============================================================================
// SCRIPT NORMALIZATION
// ============================================================================

function normalizeScript(raw) {
  if (raw.scenes) {
    // Rich schema — already in target shape
    return {
      title: raw.title,
      prContext: raw.prContext,
      scenes: raw.scenes.map(s => ({
        narration: s.narration,
        file: s.code.file,
        startLine: s.code.startLine,
        endLine: s.code.endLine,
        highlight: s.code.highlight || [],
        annotation: s.annotation || null
      }))
    };
  }
  if (raw.segments) {
    // Simple schema — synthesize defaults
    return {
      title: raw.title,
      prContext: null,
      scenes: raw.segments.map(s => ({
        narration: s.narration,
        file: s.file,
        startLine: s.startLine,
        endLine: s.endLine,
        highlight: [],          // no per-line highlight in simple schema
        annotation: null         // no annotation in simple schema
      }))
    };
  }
  throw new Error("Unrecognized script.json schema — expected either 'scenes' or 'segments'");
}

// ============================================================================
// DIFF PARSING
// ============================================================================

function parseDiff(diffText) {
  const files = new Map();
  const lines = diffText.split('\n');
  let currentFile = null;
  let currentLines = [];
  let afterLineNum = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // File header: +++ b/path/to/file or +++ /dev/null
    if (line.startsWith('+++ ')) {
      if (currentFile) {
        files.set(currentFile, currentLines);
      }
      // Extract filename and normalize (remove a/ or b/ prefix)
      let filename = line.substring(4).trim(); // Remove '+++ '
      if (filename.startsWith('b/')) {
        filename = filename.substring(2); // Remove 'b/'
      } else if (filename === '/dev/null') {
        filename = null; // New file will be set from --- line
      }
      currentFile = filename;
      currentLines = [];
      afterLineNum = 0;
      continue;
    }
    
    // Handle new files: --- /dev/null means the +++ line has the real filename
    if (line.startsWith('--- /dev/null')) {
      // Next line will be +++ b/filename
      continue;
    }
    
    // Hunk header: @@ -A,B +C,D @@
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      if (match) {
        afterLineNum = parseInt(match[1], 10);
      }
      continue;
    }
    
    // Skip file headers
    if (line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')) {
      continue;
    }
    
    // Content lines - store with real line numbers
    if (currentFile !== null && afterLineNum > 0) {
      if (line.startsWith('-')) {
        // Removed line - skip in AFTER state, don't increment line number
        continue;
      } else if (line.startsWith('+')) {
        // Added line
        currentLines.push({
          lineNumber: afterLineNum,
          text: line.substring(1), // Remove '+'
          isAdded: true
        });
        afterLineNum++;
      } else if (line.startsWith(' ')) {
        // Context line (kept)
        currentLines.push({
          lineNumber: afterLineNum,
          text: line.substring(1), // Remove leading space
          isAdded: false
        });
        afterLineNum++;
      }
    }
  }
  
  // Save last file
  if (currentFile) {
    files.set(currentFile, currentLines);
  }
  
  return files;
}

// ============================================================================
// SCENE RENDERING
// ============================================================================

function renderScene(index) {
  const scene = state.script.scenes[index];
  if (!scene) return;
  
  // Update scene indicator
  document.getElementById('scene-indicator').textContent =
    `${index + 1} / ${state.script.scenes.length}`;
  
  // Update progress bar
  const progress = ((index + 1) / state.script.scenes.length) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
  
  // Update caption
  document.getElementById('caption-text').textContent = scene.narration;
  
  // Update annotation panel
  const annotationPanel = document.getElementById('annotation-panel');
  if (scene.annotation) {
    annotationPanel.style.display = 'flex';
    document.getElementById('annotation-severity').textContent =
      scene.annotation.severity.toUpperCase();
    document.getElementById('annotation-severity').className =
      `annotation-severity severity-${scene.annotation.severity}`;
    document.getElementById('annotation-message').textContent =
      scene.annotation.message;
  } else {
    // Hide annotation panel for simple schema scenes
    annotationPanel.style.display = 'none';
  }
  
  // Update code panel
  renderCode(scene);
}

function renderCode(scene) {
  const { file, startLine, endLine, highlight } = scene;
  
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
  
  // Apply syntax highlighting
  Prism.highlightElement(codeElement);
  
  // Apply line number highlighting
  applyLineHighlights(relevantLines, highlight);
  
  // Fade in effect
  const codePanel = document.getElementById('code-panel');
  codePanel.style.opacity = '0';
  setTimeout(() => {
    codePanel.style.opacity = '1';
  }, 50);
}

function detectLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const langMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'javascript',
    'tsx': 'javascript',
    'html': 'markup',
    'htm': 'markup',
    'xml': 'markup',
    'css': 'css',
    'scss': 'css',
    'json': 'json'
  };
  return langMap[ext] || 'javascript';
}

function applyLineHighlights(relevantLines, highlightLines) {
  if (!highlightLines || highlightLines.length === 0) return;
  
  // Wait for Prism to finish rendering line numbers
  setTimeout(() => {
    const lineNumberElements = document.querySelectorAll('.line-numbers-rows > span');
    
    // Build a map of real line numbers to display indices
    const lineNumberMap = new Map();
    relevantLines.forEach((line, index) => {
      lineNumberMap.set(line.lineNumber, index);
    });
    
    // Highlight the appropriate line number elements
    highlightLines.forEach(lineNum => {
      const displayIndex = lineNumberMap.get(lineNum);
      if (displayIndex !== undefined && displayIndex < lineNumberElements.length) {
        lineNumberElements[displayIndex].setAttribute('data-highlight', 'true');
        lineNumberElements[displayIndex].classList.add('highlight-line');
      }
    });
  }, 100);
}

// ============================================================================
// PLAYBACK CONTROLS
// ============================================================================

function play() {
  if (state.isPlaying) return;
  
  state.isPlaying = true;
  document.getElementById('btn-play').style.display = 'none';
  document.getElementById('btn-pause').style.display = 'inline-block';
  
  speakCurrentScene();
}

function pause() {
  if (!state.isPlaying) return;
  
  state.isPlaying = false;
  document.getElementById('btn-play').style.display = 'inline-block';
  document.getElementById('btn-pause').style.display = 'none';
  
  // Cancel speech and clear safety timeout
  speechSynthesis.cancel();
  if (state.safetyTimeout) {
    clearTimeout(state.safetyTimeout);
    state.safetyTimeout = null;
  }
}

function previousScene() {
  // Cancel current narration and timeout
  speechSynthesis.cancel();
  if (state.safetyTimeout) {
    clearTimeout(state.safetyTimeout);
    state.safetyTimeout = null;
  }
  
  if (state.currentSceneIndex > 0) {
    state.currentSceneIndex--;
    renderScene(state.currentSceneIndex);
    
    if (state.isPlaying) {
      speakCurrentScene();
    }
  }
}

function nextScene() {
  // Cancel current narration and timeout
  speechSynthesis.cancel();
  if (state.safetyTimeout) {
    clearTimeout(state.safetyTimeout);
    state.safetyTimeout = null;
  }
  
  if (state.currentSceneIndex < state.script.scenes.length - 1) {
    state.currentSceneIndex++;
    renderScene(state.currentSceneIndex);
    
    if (state.isPlaying) {
      speakCurrentScene();
    }
  } else {
    // End of walkthrough
    pause();
  }
}

function advanceToNextScene() {
  // Clear safety timeout since we're advancing
  if (state.safetyTimeout) {
    clearTimeout(state.safetyTimeout);
    state.safetyTimeout = null;
  }
  
  if (!state.isPlaying) return;
  
  if (state.currentSceneIndex < state.script.scenes.length - 1) {
    state.currentSceneIndex++;
    renderScene(state.currentSceneIndex);
    speakCurrentScene();
  } else {
    // End of walkthrough
    pause();
  }
}

function speakCurrentScene() {
  const scene = state.script.scenes[state.currentSceneIndex];
  if (!scene) return;
  
  const utterance = new SpeechSynthesisUtterance(scene.narration);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  // Estimate duration: 80ms per character, minimum 3 seconds
  const estimatedDuration = Math.max(3000, scene.narration.length * 80);
  
  const advanceHandler = () => {
    advanceToNextScene();
  };
  
  utterance.onend = advanceHandler;
  utterance.onerror = (err) => {
    console.error('Speech synthesis error:', err);
    advanceHandler(); // Still advance on error
  };
  
  state.utterance = utterance;
  
  // Set safety timeout in case onend doesn't fire
  state.safetyTimeout = setTimeout(advanceHandler, estimatedDuration + 1000);
  
  try {
    speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Failed to speak:', err);
    advanceHandler();
  }
}

// ============================================================================
// VERDICT PARSING
// ============================================================================

function parseVoteTally(verdictText) {
  const match = verdictText.match(/\*\*Vote tally:\*\* (.+)/);
  return match ? match[1] : '👍 0 · 👎 0 · 🤔 0';
}

function parseRecommendation(verdictText) {
  const match = verdictText.match(/\*\*Recommendation:\*\* (\w+)/);
  return match ? match[1] : 'UNKNOWN';
}

function parseContentiousness(verdictText) {
  const match = verdictText.match(/\*\*Contentiousness score:\*\* ([\d.]+)/);
  return match ? match[1] : 'N/A';
}

function updateVerdictPill() {
  const pill = document.getElementById('verdict-pill');
  const rec = state.verdict.recommendation;
  pill.textContent = rec;
  pill.className = `verdict-pill verdict-${rec.toLowerCase()}`;
}

function updateVoteTally() {
  const tally = document.getElementById('vote-tally');
  tally.innerHTML = `
    ${state.verdict.voteTally}
    <span class="contentiousness">• Contentiousness: ${state.verdict.contentiousness}</span>
  `;
}

// ============================================================================
// UTILITIES
// ============================================================================

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

// ============================================================================
// Made with IBM Bob Code mode
// ============================================================================

// Made with Bob
