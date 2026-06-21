import React, { useState, useEffect } from 'react';
import { Share2, RefreshCw, Award, Heart, CheckCircle2, ChevronRight } from 'lucide-react';
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
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [details.color.from, details.color.to, '#FFD700', '#B8A3E8']
      });
    }
  }, [mbtiType, isSharedView]);

  const handleCopyLink = () => {
    // Generate serialization hash
    const hash = serializeResult(nickname, mbtiType, scores);
    // Build sharing link based on current location
    const base = window.location.origin + window.location.pathname;
    const shareUrl = `${base}?state=${hash}`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy link', err);
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // Convert scores into dimensions
  const dimensions = [
    { labelLeft: '외향성 E', labelRight: '내향성 I', val: scores[0] },
    { labelLeft: '감각 S', labelRight: '직관 N', val: scores[1] },
    { labelLeft: '사고 T', labelRight: '감정 F', val: scores[2] },
    { labelLeft: '판단 J', labelRight: '인식 P', val: scores[3] }
  ];

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div className="text-center mb-6 animate-fade-in">
        <span className="text-xs font-bold uppercase tracking-widest text-bloom-500 bg-bloom-100 px-3 py-1.5 rounded-full inline-block mb-3">
          {isSharedView ? '공유된 성격 프로필' : '나의 성격 프로필'}
        </span>
        <h2 className="text-2xl font-black text-neutral-900 leading-tight">
          {isSharedView ? `${nickname}님의 웰니스 성향` : `${nickname}님의 블룸 분석`}
        </h2>
      </div>

      {/* Bento Grid layout */}
      <div className="flex flex-col gap-5 w-full mb-8">
        
        {/* Card 1: Main Type (Full width) */}
        <div 
          className="glass-card flex flex-col items-center text-center p-8 animate-fade-in stagger-1"
          style={{ 
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, ${details.color.from}15 100%)`,
            borderColor: `${details.color.from}40`
          }}
        >
          <span className="text-6xl mb-3 animate-pulse" style={{ animationDuration: '3s' }}>
            {details.emoji}
          </span>
          <h3 className="text-lg font-semibold text-neutral-600 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            {details.subTitle}
          </h3>
          <h1 className="text-3xl font-extrabold mb-4" style={{ color: details.color.to }}>
            {mbtiType}
          </h1>
          <p className="text-lg font-bold text-neutral-900 mb-3 break-keep">
            "{details.title}"
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed break-keep">
            {details.description}
          </p>
        </div>

        {/* Bento Card: Tags (Full width) */}
        <div className="glass-card p-5 flex flex-wrap gap-2 justify-center animate-fade-in stagger-2">
          {details.tags.map((tag, i) => (
            <span 
              key={i} 
              className="text-xs font-bold px-3 py-1.5 rounded-xl border"
              style={{
                borderColor: `${details.color.to}25`,
                color: details.color.to,
                background: `${details.color.from}08`
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Card 2: Spectrum Chart (Full width) */}
        <div className="glass-card p-6 flex flex-col gap-4.5 animate-fade-in stagger-3">
          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
            <Award className="w-4 h-4 text-bloom-500" />
            성향 스펙트럼 분석
          </h4>
          
          <div className="flex flex-col gap-4">
            {dimensions.map((dim, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-bold text-neutral-600">
                  <span>{dim.labelLeft} ({100 - dim.val}%)</span>
                  <span>{dim.labelRight} ({dim.val}%)</span>
                </div>
                <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${dim.val}%`, 
                      marginLeft: 'auto',
                      background: `linear-gradient(90deg, ${details.color.from}, ${details.color.to})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Wellness Tips (Full width) */}
        <div className="glass-card p-6 flex flex-col gap-4 animate-fade-in stagger-4">
          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5 mb-2">
            <Heart className="w-4 h-4 text-bloom-500" />
            나만을 위한 웰니스 가이드
          </h4>
          
          <ul className="flex flex-col gap-3.5 text-left">
            {details.wellnessTips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-neutral-600 leading-relaxed align-top">
                <CheckCircle2 className="w-5 h-5 text-bloom-400 shrink-0 mt-0.5" />
                <span className="break-keep">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: Canvas Image Export & Share (Full width) */}
        <div className="glass-card p-6 flex flex-col items-center gap-6 animate-fade-in stagger-4">
          <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-bloom-500" />
            스토리 카드 저장 & 링크 공유
          </h4>
          
          {/* Canvas Render component */}
          <ResultCardCanvas nickname={nickname} mbtiType={mbtiType} scores={scores} />

          <div className="flex flex-col gap-3 w-full border-t border-neutral-200/50 pt-5">
            <button
              onClick={handleCopyLink}
              className="glass-button primary w-full flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              {copied ? '링크가 복사되었습니다!' : '공유용 고유 링크 복사'}
            </button>

            {isSharedView ? (
              <button
                onClick={onRestart}
                className="glass-button w-full flex items-center justify-center gap-2"
                style={{ background: 'rgba(255, 255, 255, 0.4)' }}
              >
                <span>나도 테스트하러 가기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onRestart}
                className="glass-button w-full flex items-center justify-center gap-2"
                style={{ background: 'rgba(255, 255, 255, 0.4)' }}
              >
                <RefreshCw className="w-4 h-4 text-neutral-600" />
                <span>테스트 다시하기</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default Result;
