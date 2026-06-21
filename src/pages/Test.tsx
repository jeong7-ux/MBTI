import React, { useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { QUESTIONS, calculateMBTI } from '../types';

interface TestProps {
  nickname: string;
  onComplete: (type: string, scores: number[]) => void;
  onBack: () => void;
}

export const Test: React.FC<TestProps> = ({ nickname, onComplete, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ category: string; value: string }[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx) / QUESTIONS.length) * 100);

  const handleAnswerSelect = (value: string, category: string) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const updatedAnswers = [...answers, { category, value }];
    setAnswers(updatedAnswers);

    // Small delay for smooth transition
    setTimeout(() => {
      if (currentIdx < QUESTIONS.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        const { type, scores } = calculateMBTI(updatedAnswers);
        onComplete(type, scores);
      }
      setIsTransitioning(false);
    }, 250);
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      onBack();
    }
  };

  // Category-based accent colors
  const categoryColors: Record<string, { from: string; to: string }> = {
    EI: { from: '#FF94B8', to: '#FF5C8D' },
    SN: { from: '#B8A3E8', to: '#7C5CC5' },
    TF: { from: '#FFB88C', to: '#FF8C5A' },
    JP: { from: '#86DBAA', to: '#3BAA6E' },
  };

  const currentColor = categoryColors[currentQuestion.category] || categoryColors.EI;

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 animate-fade-in" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={handlePrev}
          style={{
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1.5px solid rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.04)',
            color: '#1A1A2E',
          }}
        >
          <ChevronLeft style={{ width: 20, height: 20 }} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.5)',
          padding: '8px 16px',
          borderRadius: '100px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
        }}>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)',
            background: `linear-gradient(135deg, ${currentColor.from}, ${currentColor.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {currentIdx + 1}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#C5C5D6', fontWeight: 500 }}>/</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5A5A72' }}>
            {QUESTIONS.length}
          </span>
        </div>

        <div style={{
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${currentColor.from}30, ${currentColor.to}20)`,
          border: `1.5px solid ${currentColor.from}40`,
        }}>
          <Sparkles style={{ width: 18, height: 18, color: currentColor.to }} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex flex-col gap-2 mb-8">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${currentColor.from}, ${currentColor.to})`,
              boxShadow: `0 0 12px ${currentColor.from}60`,
            }} 
          />
        </div>
      </div>

      {/* Question Card */}
      <div 
        className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full my-auto"
        key={currentIdx}
        style={{
          animation: isTransitioning ? 'none' : 'fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        <div 
          className="glass-card flex flex-col gap-6 text-center relative overflow-hidden"
          style={{ 
            minHeight: '200px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '40px 28px',
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, ${currentColor.from}12 100%)`,
            borderColor: `${currentColor.from}40`,
          }}
        >
          {/* Decorative corner glow */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${currentColor.from}25 0%, transparent 70%)`,
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />
          
          {/* Category badge */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '100px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: currentColor.to,
            background: `${currentColor.from}18`,
            border: `1px solid ${currentColor.from}30`,
            marginBottom: '8px',
          }}>
            {currentQuestion.category === 'EI' ? '에너지 방향' : 
             currentQuestion.category === 'SN' ? '인식 방식' :
             currentQuestion.category === 'TF' ? '판단 기준' : '생활 방식'}
          </span>

          <h2 style={{ 
            fontSize: '1.15rem', 
            fontWeight: 700, 
            lineHeight: 1.65, 
            color: '#1A1A2E', 
            wordBreak: 'keep-all',
            maxWidth: '300px',
          }}>
            {currentQuestion.text.replace('{name}', nickname)}
          </h2>
        </div>

        {/* Answers */}
        <div className="flex flex-col gap-3.5 w-full mt-4">
          {currentQuestion.answers.map((ans, idx) => (
            <button
              key={`${currentIdx}-${idx}`}
              onClick={() => handleAnswerSelect(ans.value, currentQuestion.category)}
              disabled={isTransitioning}
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 4px 16px rgba(232, 54, 109, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
                padding: '20px 24px',
                textAlign: 'left',
                cursor: isTransitioning ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: 'var(--font-sans)',
                animation: `fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                animationDelay: `${0.15 + idx * 0.1}s`,
                opacity: 0,
                color: '#1A1A2E',
              }}
              onMouseEnter={(e) => {
                if (!isTransitioning) {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                  e.currentTarget.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.8), ${currentColor.from}15)`;
                  e.currentTarget.style.borderColor = `${currentColor.from}50`;
                  e.currentTarget.style.boxShadow = `0 8px 24px ${currentColor.from}18, inset 0 1px 0 rgba(255, 255, 255, 0.6)`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.55)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(232, 54, 109, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
              }}
            >
              {/* Answer indicator */}
              <span style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: `linear-gradient(135deg, ${currentColor.from}20, ${currentColor.to}15)`,
                color: currentColor.to,
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
              }}>
                {idx === 0 ? 'A' : 'B'}
              </span>
              <span style={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.55, wordBreak: 'keep-all' }}>
                {ans.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center" style={{ fontSize: '0.75rem', color: 'rgba(90, 90, 114, 0.4)' }}>
        💡 편안한 마음으로 직관적으로 떠오르는 답변을 고르세요.
      </div>
    </div>
  );
};
export default Test;
