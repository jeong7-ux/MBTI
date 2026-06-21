import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BookOpen, Clock, Heart, Flower2 } from 'lucide-react';
import type { UserResult } from '../types';


interface IntroProps {
  onStart: (nickname: string) => void;
  onViewSavedResult: (result: UserResult) => void;
}

export const Intro: React.FC<IntroProps> = ({ onStart, onViewSavedResult }) => {
  const [nickname, setNickname] = useState('');
  const [savedResult, setSavedResult] = useState<UserResult | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Check for saved result in localStorage
    const saved = localStorage.getItem('bloom_mbti_result');
    if (saved) {
      try {
        setSavedResult(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved result', e);
      }
    }
    // Trigger particle animation after mount
    setTimeout(() => setShowParticles(true), 300);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStart(nickname.trim().substring(0, 8)); // Limit to 8 characters
    }
  };

  // Floating petal particles
  const petals = ['🌸', '🩷', '✨', '💫', '🌷', '🦋'];

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Floating Petals */}
      {showParticles && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          {petals.map((petal, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                fontSize: `${14 + i * 4}px`,
                left: `${10 + i * 15}%`,
                top: `${5 + i * 12}%`,
                animation: `particle-float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
                opacity: 0.5 + (i * 0.08),
                filter: 'drop-shadow(0 2px 4px rgba(232, 54, 109, 0.15))',
              }}
            >
              {petal}
            </span>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-8" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo Icon */}
        <div 
          className="inline-flex items-center justify-center rounded-full mb-4"
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(255, 228, 235, 0.8) 0%, rgba(245, 240, 255, 0.8) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.7)',
            boxShadow: '0 8px 32px rgba(232, 54, 109, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            animation: 'bounce-gentle 3s ease-in-out infinite',
          }}
        >
          <span style={{ fontSize: '36px', filter: 'drop-shadow(0 2px 8px rgba(232, 54, 109, 0.2))' }}>🌸</span>
        </div>

        {/* App Title */}
        <h1 
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #E8366D 0%, #D946A8 50%, #7C5CC5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}
        >
          Bloom MBTI
        </h1>

        {/* Subtitle */}
        <p style={{ 
          color: '#5A5A72', 
          fontSize: '0.95rem', 
          maxWidth: '280px', 
          margin: '0 auto', 
          lineHeight: 1.7,
          fontWeight: 400,
        }}>
          가장 나다운 웰니스 성향을 찾아 떠나는<br />
          <span style={{ 
            background: 'linear-gradient(90deg, #FF94B8, #B8A3E8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600
          }}>
            감성 MBTI 여행
          </span>
        </p>

        {/* Feature pills */}
        <div className="flex justify-center gap-2 mt-5" style={{ flexWrap: 'wrap' }}>
          {[
            { icon: <Heart style={{ width: 12, height: 12 }} />, label: '웰니스 가이드' },
            { icon: <Flower2 style={{ width: 12, height: 12 }} />, label: '성향 분석' },
            { icon: <Sparkles style={{ width: 12, height: 12 }} />, label: 'AI 매칭' },
          ].map((item, i) => (
            <span
              key={i}
              className="tag-pill"
              style={{
                color: '#E8366D',
                fontSize: '0.7rem',
                gap: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {item.icon}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div className="glass-card flex flex-col gap-6 w-full max-w-sm mx-auto" style={{ position: 'relative', zIndex: 1 }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-left">
            <label htmlFor="nickname" style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#5A5A72', 
              marginLeft: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '14px' }}>✨</span> 닉네임 또는 이름
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="이름을 입력해주세요 (최대 8자)"
              maxLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="glass-button primary w-full flex items-center justify-center gap-2 mt-2"
            style={{ padding: '18px 24px', fontSize: '1.1rem', borderRadius: '20px' }}
          >
            <span>테스트 시작하기</span>
            <ArrowRight style={{ width: 20, height: 20 }} />
          </button>
        </form>

        {savedResult && (
          <div style={{ borderTop: '1px solid rgba(255, 148, 184, 0.2)', paddingTop: '20px' }} className="flex flex-col gap-3">
            <p style={{ fontSize: '0.75rem', color: '#FF94B8', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Clock style={{ width: 14, height: 14 }} /> 이전 테스트 기록이 남아있어요
            </p>
            <button
              onClick={() => onViewSavedResult(savedResult)}
              className="glass-button w-full flex items-center justify-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 228, 235, 0.6), rgba(245, 240, 255, 0.6))',
                padding: '14px 20px',
                fontSize: '0.9rem',
                borderColor: 'rgba(255, 148, 184, 0.3)',
              }}
            >
              <BookOpen style={{ width: 16, height: 16, color: '#E8366D' }} />
              <span style={{ color: '#1A1A2E' }}>{savedResult.nickname}님의 <strong style={{ color: '#E8366D' }}>{savedResult.type}</strong> 결과 보기</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center" style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ 
          fontSize: '0.7rem', 
          color: 'rgba(90, 90, 114, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'rgba(255, 228, 235, 0.5)',
            fontSize: '8px',
          }}>🔒</span>
          Zero-DB: 데이터는 로컬 브라우저에만 안전하게 저장됩니다.
        </p>
      </div>
    </div>
  );
};
export default Intro;
