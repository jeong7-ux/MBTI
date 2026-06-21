import React, { useState, useEffect } from 'react';
import { Share2, RefreshCw, Award, Heart, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { MBTI_DETAILS, serializeResult } from '../types';
import ResultCardCanvas from '../components/ResultCardCanvas';
import confetti from 'canvas-confetti';

interface ResultProps {
  nickname: string;
  mbtiType: string;
  scores: number[]; // [E, N, F, P]
  isSharedView?: boolean; // True if displaying someone else's shared result
  onRestart: () => void;
}

export const Result: React.FC<ResultProps> = ({ nickname, mbtiType, scores, isSharedView = false, onRestart }) => {
  const [copied, setCopied] = useState(false);
  const details = MBTI_DETAILS[mbtiType] || MBTI_DETAILS.INFP;

  useEffect(() => {
    // Trigger confetti on successful test completion
    if (!isSharedView) {
      // First burst
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: [details.color.from, details.color.to, '#FFD700', '#B8A3E8', '#FF94B8']
      });
      // Second burst with delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 120,
          origin: { y: 0.5, x: 0.3 },
          colors: [details.color.from, '#FFD700', '#FFC2D4']
        });
      }, 400);
    }
  }, [mbtiType, isSharedView]);

  const handleCopyLink = () => {
    const hash = serializeResult(nickname, mbtiType, scores);
    const base = window.location.origin + window.location.pathname;
    const shareUrl = `${base}?state=${hash}`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy link', err);
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  // Convert scores into dimensions
  const dimensions = [
    { labelLeft: 'E 외향', labelRight: 'I 내향', val: scores[0], emoji: '🌟' },
    { labelLeft: 'S 감각', labelRight: 'N 직관', val: scores[1], emoji: '🔮' },
    { labelLeft: 'T 사고', labelRight: 'F 감정', val: scores[2], emoji: '💝' },
    { labelLeft: 'J 판단', labelRight: 'P 인식', val: scores[3], emoji: '🦋' }
  ];

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto" style={{ maxHeight: '100vh' }}>
      {/* Title */}
      <div className="text-center mb-6 animate-fade-in">
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.7rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: details.color.to,
          background: `${details.color.from}18`,
          padding: '6px 16px',
          borderRadius: '100px',
          border: `1px solid ${details.color.from}30`,
          marginBottom: '12px',
        }}>
          {isSharedView ? '💌 공유된 프로필' : '🌸 나의 프로필'}
        </span>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#1A1A2E',
          lineHeight: 1.3,
        }}>
          {isSharedView ? `${nickname}님의 웰니스 성향` : `${nickname}님의 블룸 분석`}
        </h2>
      </div>

      {/* Bento Grid layout */}
      <div className="flex flex-col gap-5 w-full mb-8">
        
        {/* Card 1: Main Type — Hero Card */}
        <div 
          className="glass-card animate-fade-in stagger-1"
          style={{ 
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, ${details.color.from}20 100%)`,
            borderColor: `${details.color.from}50`,
            textAlign: 'center',
            padding: '36px 28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${details.color.from}30 0%, transparent 70%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          <span style={{ 
            fontSize: '4rem', 
            display: 'block', 
            marginBottom: '12px',
            filter: `drop-shadow(0 4px 12px ${details.color.from}40)`,
            animation: 'bounce-gentle 3s ease-in-out infinite',
          }}>
            {details.emoji}
          </span>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5A5A72', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>
            {details.subTitle}
          </p>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 900, 
            fontFamily: 'var(--font-display)',
            background: `linear-gradient(135deg, ${details.color.from}, ${details.color.to})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '16px',
            letterSpacing: '0.05em',
          }}>
            {mbtiType}
          </h1>
          <p style={{ 
            fontSize: '1.1rem', 
            fontWeight: 700, 
            color: '#1A1A2E', 
            marginBottom: '16px', 
            wordBreak: 'keep-all',
            lineHeight: 1.5,
          }}>
            "{details.title}"
          </p>
          <p style={{ 
            fontSize: '0.88rem', 
            color: '#5A5A72', 
            lineHeight: 1.7, 
            wordBreak: 'keep-all',
            maxWidth: '340px',
            margin: '0 auto',
          }}>
            {details.description}
          </p>
        </div>

        {/* Tags Card */}
        <div 
          className="glass-card animate-fade-in stagger-2"
          style={{ 
            padding: '20px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {details.tags.map((tag, i) => (
            <span 
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '100px',
                border: `1px solid ${details.color.from}30`,
                color: details.color.to,
                background: `linear-gradient(135deg, ${details.color.from}10, ${details.color.to}08)`,
                transition: 'all 0.3s ease',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Card 2: Spectrum Chart */}
        <div className="glass-card animate-fade-in stagger-3" style={{ padding: '28px' }}>
          <h4 style={{ 
            fontSize: '0.88rem', 
            fontWeight: 700, 
            color: '#1A1A2E', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: `${details.color.from}18`,
            }}>
              <Award style={{ width: 16, height: 16, color: details.color.to }} />
            </span>
            성향 스펙트럼 분석
          </h4>
          
          <div className="flex flex-col gap-4">
            {dimensions.map((dim, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700 }}>
                  <span style={{ color: dim.val < 50 ? details.color.to : '#5A5A72' }}>
                    {dim.emoji} {dim.labelLeft} ({100 - dim.val}%)
                  </span>
                  <span style={{ color: dim.val >= 50 ? details.color.to : '#5A5A72' }}>
                    {dim.labelRight} ({dim.val}%)
                  </span>
                </div>
                <div style={{
                  height: '10px',
                  background: 'rgba(229, 229, 240, 0.4)',
                  borderRadius: '100px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}>
                  <div 
                    style={{ 
                      height: '100%',
                      width: `${dim.val}%`,
                      borderRadius: '100px',
                      marginLeft: 'auto',
                      background: `linear-gradient(90deg, ${details.color.from}, ${details.color.to})`,
                      transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 0 10px ${details.color.from}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Wellness Tips */}
        <div className="glass-card animate-fade-in stagger-4" style={{ padding: '28px' }}>
          <h4 style={{ 
            fontSize: '0.88rem', 
            fontWeight: 700, 
            color: '#1A1A2E', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: `${details.color.from}18`,
            }}>
              <Heart style={{ width: 16, height: 16, color: details.color.to }} />
            </span>
            나만을 위한 웰니스 가이드
          </h4>
          
          <ul className="flex flex-col" style={{ gap: '16px' }}>
            {details.wellnessTips.map((tip, i) => (
              <li key={i} style={{ 
                display: 'flex', 
                gap: '12px', 
                fontSize: '0.85rem', 
                color: '#5A5A72', 
                lineHeight: 1.65,
                padding: '14px 16px',
                borderRadius: '16px',
                background: `rgba(255, 255, 255, 0.4)`,
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}>
                <CheckCircle2 style={{ 
                  width: 20, 
                  height: 20, 
                  color: details.color.from, 
                  flexShrink: 0, 
                  marginTop: '2px',
                  filter: `drop-shadow(0 0 4px ${details.color.from}30)`,
                }} />
                <span style={{ wordBreak: 'keep-all' }}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: Canvas Image Export & Share */}
        <div className="glass-card animate-fade-in stagger-4" style={{ padding: '28px', textAlign: 'center' }}>
          <h4 style={{ 
            fontSize: '0.88rem', 
            fontWeight: 700, 
            color: '#1A1A2E', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px', 
            marginBottom: '20px',
          }}>
            <Share2 style={{ width: 16, height: 16, color: details.color.to }} />
            스토리 카드 저장 & 링크 공유
          </h4>
          
          {/* Canvas Render component */}
          <ResultCardCanvas nickname={nickname} mbtiType={mbtiType} scores={scores} />

          <div className="flex flex-col gap-3 w-full" style={{ borderTop: `1px solid ${details.color.from}15`, paddingTop: '20px', marginTop: '8px' }}>
            <button
              onClick={handleCopyLink}
              className="glass-button w-full flex items-center justify-center gap-2"
              style={{
                background: copied 
                  ? 'linear-gradient(135deg, #86DBAA, #3BAA6E)' 
                  : `linear-gradient(135deg, ${details.color.from}, ${details.color.to})`,
                color: 'white',
                border: 'none',
                boxShadow: copied 
                  ? '0 8px 24px rgba(59, 170, 110, 0.3)' 
                  : `0 8px 24px ${details.color.from}40`,
                transition: 'all 0.4s ease',
              }}
            >
              {copied ? (
                <>
                  <Check style={{ width: 20, height: 20 }} />
                  링크가 복사되었습니다! ✨
                </>
              ) : (
                <>
                  <Copy style={{ width: 18, height: 18 }} />
                  공유용 고유 링크 복사
                </>
              )}
            </button>

            {isSharedView ? (
              <button
                onClick={onRestart}
                className="glass-button w-full flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 228, 235, 0.6), rgba(245, 240, 255, 0.6))',
                  borderColor: `${details.color.from}30`,
                }}
              >
                <span style={{ color: '#1A1A2E' }}>나도 테스트하러 가기</span>
                <ChevronRight style={{ width: 16, height: 16, color: details.color.to }} />
              </button>
            ) : (
              <button
                onClick={onRestart}
                className="glass-button w-full flex items-center justify-center gap-2"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.45)',
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <RefreshCw style={{ width: 16, height: 16, color: '#5A5A72' }} />
                <span style={{ color: '#5A5A72' }}>테스트 다시하기</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Result;
