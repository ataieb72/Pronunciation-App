# R3 — Clarity core (Slice 1: first real practice)

**Goal:** real practice starts on the phone, in English and French, with no cloud scoring. **Depends on:** R2 ✅. **Plan:** `docs/redesign/elocution-focus.md` §6 and §9; `docs/product-design.md` §1–4. **Ships:** Today screen, baselines, and 5- and 10-minute sessions of clear-speech pairs with self-judgement and block summaries.

## Defaults chosen for this epic

The owner asked for fewer questions (2026-09-26). These are Claude's defaults. The owner can change any of them.

| # | Default | Why |
|---|---|---|
| R3-a | **Sessions until R4 and R6 ship:** 5 minutes = warm-up + 1 block of 4 pairs; 10 minutes = warm-up + 2 blocks of 4 pairs. R4 adds the Listen stage and R6 adds the Use stage. | The design's Listen and Use stages need R4 (Azure) and R6 (talk rounds). |
| R3-b | **Baseline = the first session in each language.** 8 held-out sentences, first all 8 your usual way (no cue shown yet), then the same 8 "big and clear". About 4 minutes. The baseline sentences never appear in practice, so later Checks can reuse them. | Habitual speech must be recorded before any training, or it is lost. Held-out items keep item learning out of the comparison (`design-options.md` §6.7). |
| R3-c | **Language of the day:** the other language from the last practice day; the same language again on a day with a session already done. The Today screen has a switch. | "French and English alternate by day, 50/50" (product-design). A rule based on the date alone breaks for Monday–Wednesday–Friday habits. |
| R3-d | **One sub-cue per block.** The first block uses the cue from the last Wrap ("Open your jaw" the first time). The next block's cue targets a feature that did not change. | elocution-focus §6. |
| R3-e | **"Changed" thresholds** (clear take minus usual take, median over the block's pairs, same direction in at least 3 of 4 pairs): loudness +2 dB; pitch range +1 semitone; fade at phrase ends +1.5 dB (less trailing off). Rate is a pace note only: "about the same pace" within ±10%. | App defaults with no study behind them [None found]; test V3 tunes them. The block summary says "probably" until then. |
| R3-f | **Self-judgement** after each pair: "Which would your listener catch better?" — Usual / Clear / About the same. The takes are labelled, not hidden. | You recorded them in order, so hiding the labels would not blind you. |
| R3-g | **Weekly target:** default 4 practice days a week (3–6), Monday to Sunday, shown as dots. A session counts once its first block is done. No streaks. | `design-options.md` §6.8 [Weak]. |

## Tasks

### R3-T01: `packages/core` and the sentence banks ✅
**Type:** content/domain | **Effort:** M

#### What to Build
A new workspace `packages/core` (pure TypeScript). Everyday sentence banks in English and French, loaded with the word endings that mumblers drop (product-design §4): French words ending in a consonant plus *l* or *r* (*-ble, -tre, -dre, -pre, -cle*, and the same family such as *-bre, -vre*); English final stops and clusters (*asked, helped, world, texts*). Each item lists its target words. 40 practice sentences and 8 held-out baseline sentences per language. A picker that avoids recently used items.

#### Acceptance Criteria
- [x] 40 practice and 8 baseline items per language; unique ids; no sentence in both sets
- [x] Every item has at least 2 target words; each target word is in the sentence and has the right ending
- [x] Sentences have 6–14 words
- [x] The picker never repeats a sentence within a session and prefers ones not used recently

#### Testing Requirements (TDD)
- Bank_Sizes_40PracticeAnd8Baseline · Bank_Ids_Unique · Bank_Targets_InSentenceWithEnding · Bank_Length_6to14Words · Bank_BaselineHeldOut · Pick_NoRepeatInSession · Pick_PrefersNotRecent

**Completed (2026-09-26):** `packages/core/src/content/sentences.ts`: 40 practice and 8 baseline sentences per language, with 2–5 target words each (the R1 test sentences open the baselines). Practice sentences that were close to a baseline sentence were rewritten, so the baseline stays held out. `wordsOf` splits on apostrophes (*l’autre* → *l*, *autre*); `hasTargetEnding` checks the spelling of each ending. `pickSentences` shuffles unused items first, then takes the ones used longest ago. 111 tests.

### R3-T02: Pair comparison and block summary ✅
**Type:** domain | **Effort:** M | **Depends on:** R3-T01

#### What to Build
`packages/core`: compare the usual and clear takes of a pair on loudness, pitch range, fade and rate. A block summary over the block's good pairs: "Probably changed: …", "Not changed: …", a pace note, and the next cue (R3-d, R3-e). A feature that held in each of the last 3 sessions moves to one line, "Still holding: …", so it appears less often (product-design §3).

#### Acceptance Criteria
- [x] Needs 3 good pairs (both takes passed the quality check); otherwise "Not enough good pairs to compare"
- [x] A feature is "changed" only if the median passes its threshold and at least 3 of 4 pairs (75%) move the same way
- [x] The next cue targets a feature that did not change: loudness → "Reach the back of the room"; fade → "Keep your voice to the last word"; otherwise "Open your jaw" and "Finish every word ending" in turn
- [x] Wording is cautious ("probably"); never a score; never "slow down"

#### Testing Requirements (TDD)
- Pair_Differences_Computed · Summary_TooFewGoodPairs_SaysSo · Summary_LouderInAllPairs_Changed · Summary_MixedDirections_NotChanged · Summary_NextCue_TargetsUnchanged · Summary_SlowerClear_PaceNote_NoSlowDown · Summary_HeldThreeSessions_StillHolding

**Completed (2026-09-26):** `packages/core/src/summary.ts`: `pairDifference`, `summarizeBlock` (thresholds in `CHANGE_RULES`; a feature with fewer than 3 pairs of data is "unknown", for example the fade on short sentences), `summaryLines` for the card, and `CUE_TEXT`. 16 tests.

### R3-T03: Language of the day, session plan and weekly target ✅
**Type:** domain | **Effort:** S | **Depends on:** R3-T01

#### What to Build
`packages/core`: the language rule (R3-c), the session plan for 5 and 10 minutes (R3-a) or a baseline (R3-b), and the week's practice days against the target (R3-g).

#### Testing Requirements (TDD)
- Language_NoHistory_English · Language_NextDay_Alternates · Language_SameDay_Keeps · Language_MonWedFri_Alternates · Plan_5min_OneBlock · Plan_10min_TwoBlocks · Plan_FirstInLanguage_Baseline · Week_CountsDaysMondayToSunday · Week_TwoSessionsOneDay_CountsOnce

**Completed (2026-09-26):** `packages/core/src/schedule.ts`: `languageOfTheDay` (only sessions that counted), `planSession` (warm-up and blocks drawn without repeats, avoiding recent sentences; the baseline when a language has none), `weekProgress` (local Monday to Sunday) and `clampTarget`. The tests pass in three time zones. 16 tests (core: 143).

### R3-T04: Session storage ✅
**Type:** data | **Effort:** S | **Depends on:** R3-T03

#### What to Build
Dexie version 2: `sessions` (language, length, kind practice or baseline, blocks with cue, pairs, self-judgements and summary, counted) and `profile` (weekly target, last cue); takes gain `sessionId`, `itemId` and `role` (warm-up, usual, clear). Version 1 takes stay readable. `docs/database-schema.md` updated.

#### Testing Requirements (TDD)
- Store_UpgradeFromV1_KeepsTakes · Store_SessionSaveLoad_RoundTrips · Store_TakeRole_Saved · Profile_Defaults

**Completed (2026-09-26):** `apps/pwa/src/data/database.ts` (one Dexie instance per name, versions 1 and 2) and `data/sessionStore.ts` (start, update, get, list, profile). Block summaries live inside each session row, so the planned `summaries` store is not needed. The take store now uses the shared database and saves session, sentence and role. 6 new tests (app: 100).

### R3-T05: Session screen ⬚
**Type:** frontend | **Effort:** L | **Depends on:** R3-T02, R3-T04

#### What to Build
`#/session`: one stage at a time. Warm-up (2 sentences "big and clear" and the distance check) → blocks of 4 pairs (sentence, "Say it your usual way", then "Now big and clear" with the block's cue; Replay usual and clear; "Which would your listener catch better?") → block summary card → Wrap ("Next time: <cue>", the week's dots, no score). A take that fails the quality check asks for a retake of that take. "Skip this sentence" and "End session" are always there. The baseline runs through the same screen: all usual takes first, then all clear takes, no summary.

#### Testing Requirements (TDD)
- Session_WarmUp_ThenPairs · Pair_UsualThenClear_ThenJudge · Pair_FailedTake_AsksRetake · Block_ShowsSummaryAndNextCue · Wrap_ShowsCueAndWeek · Baseline_UsualAllThenClearAll · EndSession_SavesWhatWasDone · PageHidden_DiscardsTake

### R3-T06: Today screen ⬚
**Type:** frontend | **Effort:** M | **Depends on:** R3-T05

#### What to Build
The start page becomes Today: "Start · 10 min" (5 as an option), the language of the day with a switch, the week's dots, the weekly target (Settings), and "Record baseline" when a language has none. The recorder stays as a tool; the ZIP export includes session, sentence and role for each take.

#### Testing Requirements (TDD)
- Today_ShowsLanguageAndWeek · Today_NoBaseline_OffersBaseline · Today_Start_OpensSession · Settings_TargetChange_Saved · Export_Manifest_HasSessionAndRole

### R3-T07: Voice check on practice takes (was R2-T08) ⬚
**Type:** validation | **Depends on:** R3-T06 and a few real sessions

The owner sends one ZIP of practice takes in the chat. Claude runs the Praat reference on them and fills in `docs/validation/r2-owner-voice.md`. Only numbers are committed.
