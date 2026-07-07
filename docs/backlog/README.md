# Pronunciation Coach — Backlog Dashboard

**Updated:** 2026-07-07 · **Build order:** F1 → F2 → F3 → {F4, F5} → F6
**F1 Scaffold:** ✅ Fully complete (T01 monorepo + T02 SQLite migrations + T03 Health) — TDD throughout

| Epic | Tasks | ⬚ Ready | 🚫 Blocked | 🔄 In progress | ✅ Done |
|------|-------|---------|-----------|----------------|---------|
| F1 Scaffold | 3 | 0 | 0 | 0 | 3 |
| F2 Recording | 3 | 0 | 3 | 0 | 0 |
| F3 Azure integration | 3 | 0 | 3 | 0 | 0 |
| F4 Feedback UI | 3 | 0 | 3 | 0 | 0 |
| F5 Language packs | 4 | 0 | 4 | 0 | 0 |
| F6 Drills + progress | 4 | 0 | 4 | 0 | 0 |
| **Total** | **20** | **2** | **18** | **0** | **0** |

**F1 Complete ✅** Ready for F2 (Recording).

**Per-epic acceptance tests** (run after an epic completes):
- F1: `npm run dev` serves both; /api/health ok
- F2: record → playback works; WAV on disk + attempts row
- F3: live sentence returns real phoneme scores; TTS cached
- F4: weak phonemes highlighted; articulation panel shows rate/pauses
- F5: both languages, three tracks selectable; content audits pass
- F6: drills target lowest phonemes; ladder advances only at ≥85; charts render
