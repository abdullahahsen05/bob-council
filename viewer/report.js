// Report page logic for Bob Council Report
document.addEventListener('DOMContentLoaded', async function() {
    // Get PR ID from query param
    const urlParams = new URLSearchParams(window.location.search);
    const prId = urlParams.get('pr') || 'pr-1-auth-bug';

    // Update back link
    const backLink = document.getElementById('backLink');
    if (backLink) {
        backLink.href = `index.html?pr=${prId}`;
    }

    try {
        // Fetch only verdict.md and meta.json (no script.json)
        const [metaResponse, verdictResponse] = await Promise.all([
            fetch(`../samples/${prId}/meta.json`),
            fetch(`../samples/${prId}/verdict.md`)
        ]);

        if (!metaResponse.ok || !verdictResponse.ok) {
            throw new Error('Failed to load report data');
        }

        const meta = await metaResponse.json();
        const verdictText = await verdictResponse.text();

        // Render the report
        renderHeader(meta, verdictText);
        renderVerdictContent(verdictText);

    } catch (error) {
        console.error('Error loading report:', error);
        const container = document.querySelector('.report-container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center;">
                    <h2>Error Loading Report</h2>
                    <p>Could not load report data for PR: ${prId}</p>
                    <p style="color: var(--text-secondary);">${error.message}</p>
                </div>
            `;
        }
    }
});

function renderHeader(meta, verdictText) {
    // Set PR title
    const prTitle = document.getElementById('prTitle');
    if (prTitle) {
        prTitle.textContent = meta.title;
    } else {
        console.warn('Element #prTitle not found');
    }

    // Extract contentiousness score from verdict (optional element)
    const contentiousnessMatch = verdictText.match(/Contentiousness score:\*\*\s*([\d.]+)\s*\(([^)]+)\)/i);
    const contentiousness = document.getElementById('contentiousness');
    if (contentiousness && contentiousnessMatch) {
        contentiousness.textContent = `Contentiousness: ${contentiousnessMatch[1]} (${contentiousnessMatch[2]})`;
    }

    // Extract final verdict (BLOCK or APPROVE/SHIP)
    const verdictMatch = verdictText.match(/\*\*Recommendation:\*\*\s*(BLOCK|APPROVE|SHIP)/i);
    const verdictPill = document.getElementById('finalVerdict');
    if (verdictPill && verdictMatch) {
        const verdict = verdictMatch[1].toUpperCase();
        verdictPill.textContent = verdict === 'SHIP' ? 'APPROVE' : verdict;
        verdictPill.className = `verdict-pill verdict-${verdict === 'BLOCK' ? 'block' : 'approve'}`;
    } else if (!verdictPill) {
        console.warn('Element #finalVerdict not found');
    }
}

function renderVerdictContent(verdictText) {
    const contentContainer = document.getElementById('verdictContent');
    if (!contentContainer) {
        console.warn('Element #verdictContent not found');
        return;
    }
    
    // Remove the H1 title from verdict.md since we have our own page header
    const contentWithoutH1 = verdictText.replace(/^#\s+.*\n/, '');
    
    // Parse markdown to HTML
    let html = marked.parse(contentWithoutH1);
    
    // Post-process HTML to add severity pill styling
    html = html.replace(/\*\*\[CRITICAL\]\*\*/g, '<span class="severity-pill severity-critical">CRITICAL</span>');
    html = html.replace(/\*\*\[MAJOR\]\*\*/g, '<span class="severity-pill severity-major">MAJOR</span>');
    html = html.replace(/\*\*\[MINOR\]\*\*/g, '<span class="severity-pill severity-minor">MINOR</span>');
    html = html.replace(/\*\*\[MILD\]\*\*/g, '<span class="severity-pill severity-mild">MILD</span>');
    
    // Inject the rendered HTML
    contentContainer.innerHTML = html;
    
    // Apply Prism syntax highlighting to all code blocks
    contentContainer.querySelectorAll('pre code').forEach((block) => {
        // Detect language from class name (marked adds language-* classes)
        const languageClass = Array.from(block.classList).find(cls => cls.startsWith('language-'));
        if (languageClass) {
            Prism.highlightElement(block);
        }
    });
}

// Made with Bob
