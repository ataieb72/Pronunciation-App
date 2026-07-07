# F3 — Azure Scoring + TTS

**Goal:** real phoneme scores and cached native reference audio. **Depends on:** F2

### F3-T01: Assessment service + /api/assess ✅
**Type:** backend | **Effort:** L(8) | **Depends on:** F2-T03 | **Priority:** high

#### What to Build
Azure service module using microsoft-cognitiveservices-speech-sdk: Pronunciation Assessment with reference text, HundredMark, granularity Phoneme, prosody enabled, IPA alphabet. POST /api/assess per docs/api-reference.md: score stored WAV, persist scores + full JSON on the attempt, update phoneme_stats rolling averages in one transaction. Record ONE real Azure response as a fixture, then mock the SDK in all tests.

#### Acceptance Criteria
- [ ] Speaking a test sentence returns per-word, per-phoneme scores end-to-end
- [ ] phoneme_stats rows update with correct rolling average
- [ ] Azure failure → 502, attempt kept with null scores; missing key → startup error

#### Testing Requirements (TDD — write these FIRST)
- RollingAverage_ExistingStat_ComputesCorrectly · Assess_SdkError_Returns502KeepsAttempt · Assess_Success_PersistsPhonemeJson (mocked SDK, real fixture)

#### Documentation Updates
- docs/api-reference.md response shape confirmed against fixture

**Completed (TDD):** Assessment service with mocked SDK + fixture, rolling average, transaction update for attempt + phoneme_stats. POST /api/assess wired. Basic client call after upload.

### F3-T02: TTS endpoint with disk cache + duration index ✅
**Type:** backend | **Effort:** M(5) | **Depends on:** F3-T01 | **Priority:** high

#### What to Build
GET /api/tts?text&lang&rate: SSML prosody rate {0.75,1.0,1.25}; voices fr-FR-DeniseNeural / en-US-JennyNeural; cache MP3 by sha256(text+voice+rate); store audio duration in a cache index JSON (needed by F4 rate comparison).

#### Acceptance Criteria
- [ ] Second identical request served from cache (no SDK call — assert via mock)
- [ ] Duration recorded and returned in an X-Reference-Duration header

#### Testing Requirements (TDD — write these FIRST)
- Tts_CacheHit_SkipsSdk · Tts_RateParam_AltersSsml · CacheKey_DiffersByRate

#### Documentation Updates
- docs/api-reference.md confirmed

**Completed (TDD):** 
- TTS service with SSML prosody, sha256 cache (MP3 + index.json for duration)
- GET /api/tts returns audio + X-Reference-Duration
- Cache hit skips SDK call
- Tests: Tts_CacheHit_SkipsSdk, Tts_RateParam_AltersSsml, CacheKey_DiffersByRate

### F3-T03: Wire client record→assess loop 🚫
**Type:** frontend | **Effort:** S(2) | **Depends on:** F3-T01, F3-T02 | **Priority:** high

#### What to Build
After upload, client calls /api/assess with the exercise reference text; result stored in app state; "Play reference" button hits /api/tts. Raw result visible in console (F4 builds the real UI).

#### Acceptance Criteria
- [ ] Full loop works live: record → scores in state → reference audio plays

#### Testing Requirements (TDD — write these FIRST)
- API client tests with mocked fetch (happy, 502, 429 paths)

#### Documentation Updates
- CHANGELOG entry: end-to-end loop live
