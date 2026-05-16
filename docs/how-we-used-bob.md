# How We Used IBM Bob

A live log of every Bob session in building Bob Council.

## Bob features touched
- [x] Code mode
- [x] Plan mode
- [ ] Ask mode
- [ ] Advanced mode
- [x] Orchestrator mode
- [x] Custom modes (7 authored)
- [ ] Bob Shell
- [ ] MCP servers
- [x] Bobalytics

## Architectural notes for the pitch

> **Orchestrator + `new_task` delegation.** Bob's built-in Orchestrator mode has no direct tool access — it's a pure coordinator. It dispatches subtasks via `new_task(mode=..., message=...)`, each running in the target Custom Mode with that mode's own tool permissions. We verified this end-to-end: Orchestrator delegated to all 5 reviewer modes (council-security, council-performance, council-accessibility, council-cost, council-junior), then to council-synthesizer, then to director, across 3 PRs without us touching a button.
>
> **Refined BLOCK rule (synthesizer).** Junior's vote contributes to the tally but cannot single-handedly trigger BLOCK — only domain experts (Security / Performance / A11y / Cost) with HIGH confidence on CRITICAL findings can. Verified in pr-1 (Junior voted BLOCK but mediation correctly attributed the recommendation to Security + Cost domain experts).
>
> **Schema discovery.** When asked to author custom modes, Bob first searched its own documentation to find the actual schema (YAML-based, `customModes` array with `slug` / `name` / `roleDefinition` / `whenToUse` / `customInstructions` / `groups` fields) instead of inventing one. We treat this as a signal of meaningful tool use — the assistant respected its own platform's contract.

## Session log

| # | Time | Mode | Goal | Result |
|---|------|------|------|--------|
| 1 | 2026-05-16T14:28:51.310Z | Code | Scaffold project tree | This commit |
| 2 | 2026-05-16T14:33:50.288Z | Plan | Design 7 custom mode specs | docs/modes-spec.md committed |
| 3 | 2026-05-16T14:40:46.765Z | Code | Author 7 custom modes in custom_modes.yaml | 1 file with 7 modes |
| 4 | 2026-05-16T14:54:12.623Z | Code | Orchestrator playbook + auto-load rule | orchestrator/council-playbook.md + .bob/rules-orchestrator/01-council.md |
| 5 | 2026-05-16T14:58:32.875Z | Code | Generate 3 synthetic PR samples | 10 files in samples/, committed |
| 6 | 2026-05-16T12:45:10.747Z | Orchestrator | Council review of pr-1-auth-bug (5 reviewer subtasks + synthesizer + director via new_task) | verdict.md (BLOCK, 0.40) + script.json committed |
| 7 | 2026-05-16T13:45:10.747Z | Orchestrator | Council review of pr-2-perf-regression | verdict.md (BLOCK, 0.40) + script.json committed |
| 8 | 2026-05-16T14:45:10.747Z | Orchestrator | Council review of pr-3-a11y-miss | verdict.md (BLOCK, 0.40, A11y solo-block) + script.json committed |
| 9 | 2026-05-16T15:45:10.747Z | (manual) | Capture Bobalytics screenshot showing 99.5% Bob Factor in repo | pitch/bobalytics-screenshot.png |
| 10 | 2026-05-16T15:51:04.621Z | Code | Build viewer v1: landing page + walkthrough player with TTS narration | viewer/index.html (97 lines), viewer.js (467 lines), viewer.css (588 lines), updated deploy workflow |
| 11 | 2026-05-16T16:08:48.073Z | Code | Fix viewer: normalize script.json schemas + correct diff parser filename keys | viewer.js patched (2 bugs fixed: schema normalization for segments vs scenes, filename key normalization in diff parser) |