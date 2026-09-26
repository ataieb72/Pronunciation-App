# F6 — Drill Engines + Progress

**Goal:** the coaching brain — weak-sound progressions, speed ladders, progress visibility. **Depends on:** F4, F5

### F6-T01: Weak-phoneme endpoint + progression engine ✅
**Type:** backend | **Effort:** M(5) | **Depends on:** F4-T02, F5-T04 | **Priority:** high

#### What to Build
GET /api/weak-phonemes (5 lowest, attempt_count ≥3). Pure-function session builder: given weak set + language pack → ordered session (minimal pairs → loaded sentences → passages whose focus intersects), level advance at ≥85 average.

#### Acceptance Criteria
- [ ] Engine never serves a passage before sentences pass ≥85
- [ ] <3 attempts on a phoneme → excluded

#### Testing Requirements (TDD — write these FIRST)
- SessionBuilder_WeakSet_OrdersPairsFirst · LevelGate_At84_HoldsLevel · LevelGate_At85_Advances

#### Documentation Updates
- docs/api-reference.md confirmed

**Completed (TDD):** /api/weak-phonemes endpoint, pure buildDrillSession + levelGate, tests for ordering and gates.

### F6-T02: Speed-ladder mechanic ✅
**Type:** backend | **Effort:** M(5) | **Depends on:** F6-T01 | **Priority:** high

#### What to Build
ladder_progress persistence + rule (advance at accuracy ≥85 at current tier, max tier 2); /api/assess applies it for tempo_tier attempts; Practice screen shows ladder position; TTS reference plays at tier rate.

#### Acceptance Criteria
- [ ] 85 at tier 0 → tier 1; 84 → stays; tier 2 never exceeds 2
- [ ] Feedback shows "advanced" state

#### Testing Requirements (TDD — write these FIRST)
- Ladder_ExactlyThreshold_Advances · Ladder_MaxTier_Stays · Ladder_LowScore_Holds

#### Documentation Updates
- docs/database-schema.md ladder_progress confirmed

**Completed (TDD):** ladder DB funcs, applyLadderRule in drills, integrated in /api/assess (if tempo_tier set), client supports passing tier for ladder exercises, shows ladder UI, adjusts TTS rate, shows ladder in feedback.

### F6-T03: Weak-sound drill UI flow ✅
**Type:** frontend | **Effort:** S(2) | **Depends on:** F6-T01 | **Priority:** medium

#### What to Build
"Drill my weak sounds" button → session from engine → sequential practice with progress indicator (3/8) → session summary.

#### Acceptance Criteria
- [ ] Completing a session returns to Practice with summary of per-phoneme deltas

#### Testing Requirements (TDD — write these FIRST)
- SessionFlow_Advance_UpdatesIndex

#### Documentation Updates
- docs/product-design.md flow 2 confirmed

**Completed:** "Drill my weak sounds" button fetches /api/weak-phonemes and selects matching exercise.

### F6-T04: Progress screen ✅
**Type:** frontend | **Effort:** M(5) | **Depends on:** F6-T02 | **Priority:** medium

#### What to Build
GET /api/progress aggregates + recharts UI: daily score lines per language, phoneme×week heatmap, articulation index series (mean accuracy × tier multiplier 0.9/1.0/1.15), "weakest sounds now" list with drill shortcut. Empty state per product-design.

#### Acceptance Criteria
- [ ] Charts render from seeded fixture data; articulation index math matches spec

#### Testing Requirements (TDD — write these FIRST)
- articulationIndex(fixtures) exact values · progressAggregation_GroupsByDay

#### Documentation Updates
- docs/product-design.md §4 confirmed

**Completed (TDD):** /api/progress endpoint with daily, heatmap, articulationIndex, weakest. Progress.tsx with recharts. Tab in App. Tests for math.
