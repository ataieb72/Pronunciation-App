# F2 — Recording Pipeline

**Goal:** mic → 16 kHz mono WAV → uploaded, stored attempt. Riskiest epic — do first after scaffold. **Depends on:** F1

### F2-T01: WAV encoder utility 🚫
**Type:** frontend | **Effort:** M(5) | **Depends on:** F1-T01 | **Priority:** high

#### What to Build
client/src/audio/wavEncoder: AudioBuffer → 16 kHz 16-bit mono PCM WAV (resample via OfflineAudioContext, hand-rolled RIFF header). Pure function where possible.

#### Acceptance Criteria
- [ ] Output parses as valid WAV (44-byte header, correct sizes) for mono and stereo inputs at 44.1/48 kHz

#### Testing Requirements (TDD — write these FIRST)
- Golden-file tests: fixed Float32 buffer → expected byte prefix; header fields (sample rate 16000, bits 16, channels 1)

#### Documentation Updates
- docs/technical-design.md §2 confirmed

### F2-T02: Recorder hook + Practice screen shell 🚫
**Type:** frontend | **Effort:** M(5) | **Depends on:** F2-T01 | **Priority:** high

#### What to Build
useRecorder hook (getUserMedia, MediaRecorder, stop → WAV via encoder, playback URL). Practice screen: language toggle (localStorage), 3 hardcoded sentences per language, record/stop buttons, waveform (canvas, analyser node), local playback. Mic-permission-denied state per product-design.

#### Acceptance Criteria
- [ ] Record → stop → play hears the recording in Chrome and Edge
- [ ] Language toggle persists across reload

#### Testing Requirements (TDD — write these FIRST)
- Hook state machine tests (idle→recording→ready) with mocked MediaRecorder

#### Documentation Updates
- docs/product-design.md §1 deltas

### F2-T03: Attempt upload endpoint + wiring 🚫
**Type:** backend | **Effort:** M(5) | **Depends on:** F1-T02, F2-T02 | **Priority:** high

#### What to Build
POST /api/attempts (multer multipart) storing WAV under server/audio/{yyyy-mm}/, inserting attempts row; GET /api/attempts/:id/audio. Client auto-uploads on stop.

#### Acceptance Criteria
- [ ] After stop, file exists on disk and row exists with correct language/exercise_id

#### Testing Requirements (TDD — write these FIRST)
- Upload_ValidWav_Creates201AndRow · Upload_MissingFields_400 · GetAudio_UnknownId_404

#### Documentation Updates
- docs/api-reference.md confirmed
