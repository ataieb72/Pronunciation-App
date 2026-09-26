# Pronunciation Coach v2 — Backlog Dashboard

**Updated:** 2026-09-26 · **Plan:** `docs/redesign/elocution-focus.md` §9 (Option B, elocution-first) · **v1 backlog:** `docs/archive/v1/backlog/`

Status icons: `⬚` ready · `🔄` in progress · `✅` done · `🚫` blocked. Tasks are named `R{n}-T{NN}`. One task in progress at a time.

| Epic | Goal | Tasks | Status |
|------|------|-------|--------|
| [R1](epics/R1-reset-and-phone-test.md) Reset and phone test | Clean v2 workspace; app on GitHub Pages with the Azure key typed on the phone (ADR 002); go/no-go on the Pixel | 7 ✅ | ✅ |
| [R2](epics/R2-to-R11-outline.md#r2) Audio core + clarity signals | Reliable recording; level, fade, pauses, rate, pitch on the phone, checked against Praat | — | ⬚ |
| [R3](epics/R2-to-R11-outline.md#r3) Clarity core | **Slice 1:** baselines, clear-speech pairs, block summaries, 5/10-min sessions, both languages, no cloud scoring | — | ⬚ |
| [R4](epics/R2-to-R11-outline.md#r4) Machine listener in noise | Café noise, personal noise level, Azure speech-to-text, "They heard…" | — | ⬚ |
| [R5](epics/R2-to-R11-outline.md#r5) Check recording and backup | Progress Check flow; encrypted backup file | — | ⬚ |
| [R6](epics/R2-to-R11-outline.md#r6) Short talk | Everyday talk rounds; fade and drop measures | — | ⬚ |
| [R7](epics/R2-to-R11-outline.md#r7) English sound support | Stress, vowel pairs, English word endings | — | ⬚ |
| [R8](epics/R2-to-R11-outline.md#r8) Trust levels and validation | Measures earn trust before they give hints | — | ⬚ |
| [R9](epics/R2-to-R11-outline.md#r9) Check analysis and Progress | Honest progress with ranges | — | ⬚ |
| [R10](epics/R2-to-R11-outline.md#r10) Panel and habit tools | Listener panel; weekly voice note; if-then plans | — | ⬚ |
| [R11](epics/R2-to-R11-outline.md#r11) Experiments (optional) | Camera jaw/lip feedback; pitch line; vendor pilot | — | ⬚ |

**Order:** R1 → R2 → R3 (first practice slice) → R4 → R5 → R6 → R7 → R8 → R9 → R10 → R11. Each epic's tasks are detailed when it starts.

**Owner actions outstanding:**
- ~~Rotate the Azure key~~ — not needed: Microsoft deleted the old subscription on 2026-09-11, so the v1 key is dead.
- Delete the v1 Render service (hygiene; `docs/deployment-guide.md` step 1b).
- ~~Create a Free F0 Speech resource~~ — done (2026-09-26). Budget alert: done (2026-09-25).
- ~~Switch on GitHub Pages and merge v2 into `master`~~ — done (2026-09-26); first deploy green.
- ~~Install the app on the Pixel, paste the Azure key and run the phone test~~ — done (2026-09-26); PWA confirmed.
- ~~Cloudflare account, API token, GitHub secrets~~ — not needed since ADR 002 (2026-09-26).
