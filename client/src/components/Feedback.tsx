import { useState } from 'react';
import { scoreColor, type ScoreColor } from '../lib/scoreColor';

interface Phoneme {
  phoneme: string;
  score: number;
}

interface Word {
  word: string;
  score: number;
  phonemes: Phoneme[];
}

interface FeedbackProps {
  scores: {
    overall: number;
    accuracy: number;
    fluency: number;
    prosody?: number;
  };
  words: Word[];
  onRetry?: () => void;
  onNext?: () => void;
}

export function Feedback({ scores, words, onRetry, onNext }: FeedbackProps) {
  const [expandedWord, setExpandedWord] = useState<number | null>(null);

  const getColorClass = (score: number): ScoreColor => scoreColor(score);

  const toggleWord = (index: number) => {
    setExpandedWord(expandedWord === index ? null : index);
  };

  return (
    <div className="feedback">
      <div className="scores-large">
        <div className="score-item">
          <div className="label">Accuracy</div>
          <div className={`value ${getColorClass(scores.accuracy)}`}>{Math.round(scores.accuracy)}</div>
        </div>
        <div className="score-item">
          <div className="label">Fluency</div>
          <div className={`value ${getColorClass(scores.fluency)}`}>{Math.round(scores.fluency)}</div>
        </div>
        {scores.prosody != null && (
          <div className="score-item">
            <div className="label">Prosody</div>
            <div className={`value ${getColorClass(scores.prosody)}`}>{Math.round(scores.prosody)}</div>
          </div>
        )}
        <div className="score-item">
          <div className="label">Overall</div>
          <div className={`value ${getColorClass(scores.overall)}`}>{Math.round(scores.overall)}</div>
        </div>
      </div>

      <div className="sentence">
        {words.map((word, idx) => (
          <span
            key={idx}
            className={`word ${getColorClass(word.score)}`}
            onClick={() => toggleWord(idx)}
            style={{ cursor: 'pointer' }}
          >
            {word.word}{' '}
            {expandedWord === idx && word.phonemes.length > 0 && (
              <span className="phonemes">
                (
                {word.phonemes.map((p, pidx) => (
                  <span key={pidx} className={getColorClass(p.score)}>
                    {p.phoneme}:{Math.round(p.score)}{pidx < word.phonemes.length - 1 ? ' ' : ''}
                  </span>
                ))}
                )
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="actions">
        {onRetry && <button onClick={onRetry}>Retry</button>}
        {onNext && <button onClick={onNext}>Next</button>}
      </div>
    </div>
  );
}
