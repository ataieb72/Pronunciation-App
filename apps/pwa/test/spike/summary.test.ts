import { describe, expect, it } from 'vitest';
import { summarizeAzureJson } from '../../src/spike/summary';

// Shape returned by the JS SDK (SpeechServiceResponse_JsonResult): scores nested under PronunciationAssessment.
const sdkShape = JSON.stringify({
  RecognitionStatus: 'Success',
  DisplayText: 'Ship.',
  NBest: [
    {
      Display: 'Ship.',
      PronunciationAssessment: { AccuracyScore: 80, FluencyScore: 90, CompletenessScore: 100, PronScore: 84, ProsodyScore: 71 },
      Words: [
        {
          Word: 'ship',
          PronunciationAssessment: { AccuracyScore: 80, ErrorType: 'None' },
          Phonemes: [
            { Phoneme: 'ʃ', PronunciationAssessment: { AccuracyScore: 95 } },
            { Phoneme: 'ɪ', PronunciationAssessment: { AccuracyScore: 60 } },
            { Phoneme: 'p', PronunciationAssessment: { AccuracyScore: 85 } },
          ],
        },
      ],
    },
  ],
});

// Flat shape (REST API style): scores directly on NBest[0]; French returns phonemes without names.
const flatFrench = JSON.stringify({
  DisplayText: 'Bonjour.',
  NBest: [
    {
      AccuracyScore: 97,
      FluencyScore: 99,
      CompletenessScore: 100,
      PronScore: 98,
      Words: [{ Word: 'bonjour', AccuracyScore: 97, Phonemes: [{ AccuracyScore: 99 }, { Phoneme: '', AccuracyScore: 95 }] }],
    },
  ],
});

describe('summarizeAzureJson', () => {
  it('Summary_SdkShape_ReadsNestedScoresAndPhonemeNames', () => {
    expect(summarizeAzureJson(sdkShape)).toEqual({
      text: 'Ship.',
      scores: { accuracy: 80, fluency: 90, completeness: 100, pron: 84, prosody: 71 },
      words: 1,
      phonemes: 3,
      phonemesNamed: true,
    });
  });

  it('Summary_FlatFrench_ReadsFlatScores_PhonemesUnnamed', () => {
    expect(summarizeAzureJson(flatFrench)).toEqual({
      text: 'Bonjour.',
      scores: { accuracy: 97, fluency: 99, completeness: 100, pron: 98, prosody: null },
      words: 1,
      phonemes: 2,
      phonemesNamed: false,
    });
  });

  it('Summary_BadJson_ReturnsNull', () => {
    expect(summarizeAzureJson('not json')).toBeNull();
    expect(summarizeAzureJson('{}')).toBeNull();
  });
});
