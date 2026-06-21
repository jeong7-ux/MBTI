import React, { useState } from 'react';
import { ChevronLeft, HelpCircle, Sparkles } from 'lucide-react';
import { QUESTIONS, calculateMBTI } from '../types';

interface TestProps {
  nickname: string;
  onComplete: (type: string, scores: number[]) => void;
  onBack: () => void;
}

export const Test: React.FC<TestProps> = ({ nickname, onComplete, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ category: string; value: string }[]>([]);

  const currentQuestion = QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx) / QUESTIONS.length) * 100);

  const handleAnswerSelect = (value: string, category: string) => {
    const updatedAnswers = [...answers, { category, value }];
    setAnswers(updatedAnswers);

    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Complete! Calculate result
      const { type, scores } = calculateMBTI(updatedAnswers);
      onComplete(type, scores);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      onBack();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={handlePrev}
          className="p-2 rounded-full bg-white/40 border border-white/50 text-neutral-900 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-neutral-900" style={{ fontFamily: 'var(--font-display)' }}>
          {currentIdx + 1} / {QUESTIONS.length}
        </span>
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40 border border-white/50 text-bloom-500">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-2 mb-8">
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full my-auto">
        <div className="glass-card flex flex-col gap-6 text-center py-10 px-8 relative overflow-hidden" style={{ minHeight: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="absolute top-4 left-4 text-bloom-300">
            <HelpCircle className="w-5 h-5 opacity-40" />
          </div>
          
          <h2 className="text-xl font-bold leading-relaxed text-neutral-900 break-keep">
            {currentQuestion.text.replace('{name}', nickname)}
          </h2>
        </div>

        {/* Answers */}
        <div className="flex flex-col gap-3.5 w-full mt-4">
          {currentQuestion.answers.map((ans, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(ans.value, currentQuestion.category)}
              className="glass-button text-left justify-start hover:bg-white/80 active:scale-95 border-white/50 text-neutral-900 py-5 px-6 leading-normal break-keep"
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 15px rgba(232, 54, 109, 0.03)',
                animationDelay: `${idx * 0.1}s`
              }}
            >
              <span className="font-medium text-[15px]">{ans.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-neutral-600/50">
        💡 편안한 마음으로 직관적으로 떠오르는 답변을 고르세요.
      </div>
    </div>
  );
};
export default Test;
