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
  utterance: null
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
    const [script, diffText, verdictText] = await Promise.all([
      fetchJSON(`samples/${slug}/script.json`),
      fetchText(`../samples/${slug}/pr.diff`),
      fetchText(`../samples/${slug}/verdict.md`)
    ]);
    
    state.script = script;
    state.parsedDiff = parseDiff(diffText);
    state.verdict = {
      recommendation: parseRecommendation(verdictText),
      voteTally: parseVoteTally(verdictText),
      contentiousness: parseContentiousness(verdictText)
    };
    
    // Update header
    document.getElementById('pr-title').textContent = script.title;
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
    
    // File header: +++ b/path/to/file
    if (line.startsWith('+++ b/')) {
      if (currentFile) {
        files.set(currentFile, { lines: currentLines, maxLine: afterLineNum });
      }
      currentFile = line.substring(6); // Remove '+++ b/'
      currentLines = [];
      afterLineNum = 0;
      continue;
    }
    
    // Hunk header: @@ -A,B +C,D @@
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      if (match) {
        afterLineNum = parseInt(match[1], 10) - 1;
      }
      continue;
    }
    
    // Skip file headers
    if (line.startsWith('---') || line.startsWith('diff ') || line.startsWith('index ')) {
      continue;
    }
    
    // Content lines
    if (currentFile !== null) {
      if (line.startsWith('-')) {
        // Removed line - skip in AFTER state
        continue;
      } else if (line.startsWith('+')) {
        // Added line
        afterLineNum++;
        currentLines.push(line.substring(1)); // Remove '+'
      } else {
        // Context line (kept)
        afterLineNum++;
        currentLines.push(line.substring(1)); // Remove leading space
      }
    }
  }
  
  // Save last file
  if (currentFile) {
    files.set(currentFile, { lines: currentLines, maxLine: afterLineNum });
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
  
  // Update annotation
  if (scene.annotation) {
    document.getElementById('annotation-severity').textContent = 
      scene.annotation.severity.toUpperCase();
    document.getElementById('annotation-severity').className = 
      `annotation-severity severity-${scene.annotation.severity}`;
    document.getElementById('annotation-message').textContent = 
      scene.annotation.message;
  }
  
  // Update code panel
  renderCode(scene.code);
}

function renderCode(codeSpec) {
  const { file, startLine, endLine, highlight } = codeSpec;
  
  // Update file name
  document.getElementById('file-name').textContent = file;
  
  // Get file content from parsed diff
  const fileData = state.parsedDiff.get(file);
  if (!fileData) {
    console.error(`File not found in diff: ${file}`);
    return;
  }
  
  // Extract lines (1-based to 0-based indexing)
  const lines = fileData.lines.slice(startLine - 1, endLine);
  const codeText = lines.join('\n');
  
  // Detect language from file extension
  const language = detectLanguage(file);
  
  // Update code element
  const codeElement = document.getElementById('code-content');
  codeElement.textContent = codeText;
  codeElement.className = `language-${language}`;
  
  // Apply syntax highlighting
  Prism.highlightElement(codeElement);
  
  // Apply line number highlighting
  applyLineHighlights(startLine, highlight);
  
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

function applyLineHighlights(startLine, highlightLines) {
  if (!highlightLines || highlightLines.length === 0) return;
  
  // Wait for Prism to finish rendering line numbers
  setTimeout(() => {
    const lineNumberElements = document.querySelectorAll('.line-numbers-rows > span');
    const codeLines = document.querySelectorAll('#code-content .token');
    
    highlightLines.forEach(lineNum => {
      const index = lineNum - startLine;
      if (index >= 0 && index < lineNumberElements.length) {
        // Highlight line number
        lineNumberElements[index].classList.add('highlight-line');
        
        // Highlight code line - find the parent line
        const codeElement = document.getElementById('code-content');
        const allLines = codeElement.textContent.split('\n');
        if (index < allLines.length) {
          // Add a wrapper span for the highlighted line
          // This is a simplified approach - in production you'd want more robust line tracking
        }
      }
    });
    
    // Add highlight class to code lines
    const pre = document.querySelector('#code-panel pre');
    const codeContent = document.getElementById('code-content').textContent;
    const lines = codeContent.split('\n');
    
    highlightLines.forEach(lineNum => {
      const index = lineNum - startLine;
      if (index >= 0 && index < lines.length) {
        // Mark the line for CSS styling
        const lineSpan = lineNumberElements[index];
        if (lineSpan) {
          lineSpan.setAttribute('data-highlight', 'true');
        }
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
  
  if (state.utterance) {
    speechSynthesis.cancel();
  }
}

function previousScene() {
  if (state.currentSceneIndex > 0) {
    state.currentSceneIndex--;
    renderScene(state.currentSceneIndex);
    
    if (state.isPlaying) {
      speechSynthesis.cancel();
      speakCurrentScene();
    }
  }
}

function nextScene() {
  if (state.currentSceneIndex < state.script.scenes.length - 1) {
    state.currentSceneIndex++;
    renderScene(state.currentSceneIndex);
    
    if (state.isPlaying) {
      speechSynthesis.cancel();
      speakCurrentScene();
    }
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
  
  utterance.onend = () => {
    if (state.isPlaying) {
      // Auto-advance to next scene
      if (state.currentSceneIndex < state.script.scenes.length - 1) {
        nextScene();
      } else {
        pause();
      }
    }
  };
  
  utterance.onerror = (err) => {
    console.error('Speech synthesis error:', err);
  };
  
  state.utterance = utterance;
  speechSynthesis.speak(utterance);
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
