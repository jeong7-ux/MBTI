'use client';
import { useEffect } from 'react';
import type { PublicQuestion, Choice } from '@contract';

/**
 * 양자택일 문항 카드 — 계약 AnswerInput.choice='A'|'B'에 맞춘 이지선다.
 *  - sentence: 문장 stem + A/B(textA/textB, 예: 그렇다/아니다)
 *  - word_pair: 좌우 대형 타깃(3초/문항 목표), A/B 키보드
 * 선택 즉시 다음(전환 지연 0)은 부모가 처리. 여기선 선택 이벤트만 발화.
 * a11y: role=radiogroup, A/B 키, 스크린리더 낭독(문항 텍스트가 곧 라벨).
 */
export function QuestionCard({
  question, value, onSelect,
}: {
  question: PublicQuestion;
  value: Choice | null;
  onSelect: (c: Choice) => void;
}) {
  // A/B 키보드 (PRD §10)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === 'a' || k === '1' || e.key === 'ArrowLeft') { onSelect('A'); }
      else if (k === 'b' || k === '2' || e.key === 'ArrowRight') { onSelect('B'); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onSelect]);

  const isWord = question.format === 'word_pair';

  return (
    <div className="card" style={{ padding: 28 }}>
      {question.stem && <p className="q-stem" id={`stem-${question.questionId}`}>{question.stem}</p>}
      {isWord && (
        <p className="sec-sub" style={{ textAlign: 'center' }} id={`stem-${question.questionId}`}>
          더 나를 잘 나타내는 쪽을 고르세요
        </p>
      )}

      {isWord ? (
        <div className="wp-grid" role="radiogroup" aria-labelledby={`stem-${question.questionId}`}>
          <WpPanel word={question.textA} k="A" sel={value === 'A'} onClick={() => onSelect('A')} />
          <WpPanel word={question.textB} k="B" sel={value === 'B'} onClick={() => onSelect('B')} />
        </div>
      ) : (
        <div className="q-choices" role="radiogroup" aria-labelledby={`stem-${question.questionId}`}>
          <ChoiceBtn label={question.textA} k="A" sel={value === 'A'} onClick={() => onSelect('A')} />
          <ChoiceBtn label={question.textB} k="B" sel={value === 'B'} onClick={() => onSelect('B')} />
        </div>
      )}

      <p className="note" style={{ textAlign: 'center' }}>
        키보드 <kbd className="token">A</kbd> / <kbd className="token">B</kbd> 로도 선택할 수 있어요. 첫 직관대로 편하게 고르세요.
      </p>
    </div>
  );
}

function ChoiceBtn({ label, k, sel, onClick }: { label: string; k: string; sel: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`q-choice${sel ? ' sel' : ''}`} role="radio" aria-checked={sel} onClick={onClick}>
      <span className="kbd" aria-hidden="true">{k}</span>
      <span>{label}</span>
    </button>
  );
}

function WpPanel({ word, k, sel, onClick }: { word: string; k: string; sel: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`wp-panel${sel ? ' sel' : ''}`} role="radio" aria-checked={sel} onClick={onClick}>
      <span className="kbd" aria-hidden="true">{k}</span>
      <span className="wp-word">{word}</span>
    </button>
  );
}
