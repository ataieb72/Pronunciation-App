# F4 — Feedback UI

**Goal:** actionable feedback on both pronunciation and articulation after every attempt. **Depends on:** F3

### F4-T01: Score display + word/phoneme breakdown ✅
**Type:** frontend | **Effort:** M(5) | **Depends on:** F3-T03 | **Priority:** high

#### What to Build
Feedback screen: Accuracy/Fluency/Prosody as large numbers (prosody nullable → hide gracefully); sentence with words colored green ≥85 / amber 60–84 / red <60; tap a word → phonemes with scores + expected IPA (from language pack phonemes.json).

#### Acceptance Criteria
- [ ] Threshold colors exact at boundaries (85 green, 84 amber, 60 amber, 59 red)
- [ ] Null prosody renders without layout break

#### Testing Requirements (TDD — write these FIRST)
- scoreColor(85)=green, (84)=amber, (60)=amber, (59)=red · WordRow_Tap_ExpandsPhonemes

#### Documentation Updates
- docs/product-design.md §2 confirmed

**Completed (TDD):** scoreColor util, Feedback component with colored words + expandable phonemes, integrated into App after assess. Threshold colors tested. Basic parse for current assess data.

### F4-T02: Articulation panel 🚫
**Type:** frontend | **Effort:** M(5) | **Depends on:** F4-T01 | **Priority:** high

#### What to Build
Panel showing: speaking rate vs. reference ("12% faster than reference" using attempt duration vs. X-Reference-Duration), unexpected pauses/breaks from Azure word-level break info, stress feedback where present, and for ladder attempts the tier result + advanced/not.

#### Acceptance Criteria
- [ ] Rate comparison correct against fixture data; pause list positions match fixture

#### Testing Requirements (TDD — write these FIRST)
- rateDelta(attempt=5.6s, ref=5.0s)="+12%" · extractPauses(fixture) snapshot

#### Documentation Updates
- docs/product-design.md §2 articulation panel confirmed

### F4-T03: Replay attempt vs reference 🚫
**Type:** frontend | **Effort:** S(2) | **Depends on:** F4-T01 | **Priority:** medium

#### What to Build
Side-by-side "Play reference" / "Play my attempt" (GET /api/attempts/:id/audio), single shared audio element so plays never overlap. Retry / Next actions.

#### Acceptance Criteria
- [ ] Starting one playback stops the other

#### Testing Requirements (TDD — write these FIRST)
- AudioController_PlaySecond_StopsFirst

#### Documentation Updates
- —
