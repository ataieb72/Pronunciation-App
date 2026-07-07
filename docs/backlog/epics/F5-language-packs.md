# F5 — Three-Track Language Packs (FR + EN)

**Goal:** the actual training content, both languages, three tracks. Can run in parallel with F4. **Depends on:** F3

### F5-T01: Pack schema + loader + phoneme inventories 🔄
**Type:** frontend | **Effort:** M(5) | **Depends on:** F3-T03 | **Priority:** high

#### What to Build
JSON schema for exercises ({ id, track, text, focus[], difficulty, level, speedLadder?, shadowing? }); dynamic pack loader by locale; phonemes.json for fr-FR (incl. nasals ɑ̃ ɛ̃ ɔ̃, ʁ, y/u contrast) and en-US (incl. θ ð, ɪ/iː, æ/ʌ) with IPA, example word, difficulty note. Loader validates packs at startup (dev-time error listing offending entries).

#### Acceptance Criteria
- [ ] Invalid exercise entry fails validation with path to the entry
- [ ] Both locales load and expose phoneme lookup by Azure label

#### Testing Requirements (TDD — write these FIRST)
- PackValidator_MissingTrack_ReportsPath · Loader_UnknownLocale_Throws

#### Documentation Updates
- docs/technical-design.md §4 confirmed

### F5-T02: French content (3 tracks) 🚫
**Type:** docs | **Effort:** L(8) | **Depends on:** F5-T01 | **Priority:** high

#### What to Build
fr-FR/exercises.json — Track A: 40+ minimal pairs (vin/vent, dessus/dessous, rue/roue, poisson/poison…), 20+ loaded sentences, 6+ passages per major target sound. Track B: 15+ speedLadder tongue twisters/cluster drills (les chaussettes de l'archiduchesse, je ne le lui redemanderai pas…), 6+ clarity passages. Track C: 15+ liaison/enchaînement drills, 8+ shadowing exercises. All tagged with focus/difficulty/level.

#### Acceptance Criteria
- [ ] Counts met; every entry passes validation; every focus phoneme exists in phonemes.json

#### Testing Requirements (TDD — write these FIRST)
- ContentAudit_FrFr_MeetsMinimumCounts (automated count/link test)

#### Documentation Updates
- docs/prd.md §5 counts confirmed

### F5-T03: English content (3 tracks) 🚫
**Type:** docs | **Effort:** L(8) | **Depends on:** F5-T01 | **Priority:** high

#### What to Build
en-US/exercises.json — Track A: 40+ minimal pairs (ship/sheep, bat/but, three/tree, work/walk…), 20+ loaded sentences, 6+ passages. Track B: 15+ speedLadder drills (strengths, sixth, crisps…), 6+ clarity passages. Track C: 15+ stress-timing/contrastive-stress drills, 8+ shadowing. Same tagging rules.

#### Acceptance Criteria
- [ ] Counts met; validation passes; focus links resolve

#### Testing Requirements (TDD — write these FIRST)
- ContentAudit_EnUs_MeetsMinimumCounts

#### Documentation Updates
- docs/prd.md §5 counts confirmed

### F5-T04: Exercise picker screen 🚫
**Type:** frontend | **Effort:** M(5) | **Depends on:** F5-T02, F5-T03 | **Priority:** medium

#### What to Build
Picker with filters (track, difficulty, focus, level) per product-design §3; personal best from attempts; selecting an exercise routes to Practice.

#### Acceptance Criteria
- [ ] Filters compose (track=articulation + difficulty=2 shows only matching)

#### Testing Requirements (TDD — write these FIRST)
- filterExercises composition unit tests

#### Documentation Updates
- docs/product-design.md §3 confirmed
