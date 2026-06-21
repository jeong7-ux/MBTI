import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, BookOpen, Clock } from 'lucide-react';
import type { UserResult } from '../types';


interface IntroProps {
  onStart: (nickname: string) => void;
  onViewSavedResult: (result: UserResult) => void;
}

export const Intro: React.FC<IntroProps> = ({ onStart, onViewSavedResult }) => {
  const [nickname, setNickname] = useState('');
  const [savedResult, setSavedResult] = useState<UserResult | null>(null);

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
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onStart(nickname.trim().substring(0, 8)); // Limit to 8 characters
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/40 border border-white/60 mb-4 shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>
          <span className="text-3xl">🌸</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-neutral-900" style={{ fontFamily: 'var(--font-display)' }}>
          Bloom MBTI
        </h1>
        <p className="text-neutral-600 text-sm max-w-xs mx-auto">
          가장 나다운 웰니스 성향을 찾아 떠나는<br />감성 MBTI 여행
        </p>
      </div>

      <div className="glass-card flex flex-col gap-6 w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 align-left text-left">
            <label htmlFor="nickname" className="text-sm font-semibold text-neutral-600 ml-1">
              닉네임 또는 이름
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="이름을 입력해주세요 (최대 8자)"
              maxLength={8}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-neutral-300 bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-bloom-300 focus:border-bloom-400 text-neutral-900 transition-all placeholder:text-neutral-300 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={!nickname.trim()}
            className="glass-button primary w-full flex items-center justify-center gap-2 mt-2"
          >
            시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {savedResult && (
          <div className="border-t border-neutral-200/50 pt-4 flex flex-col gap-3">
            <p className="text-xs text-neutral-600 text-center flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 이전 테스트 기록이 남아있어요
            </p>
            <button
              onClick={() => onViewSavedResult(savedResult)}
              className="glass-button w-full flex items-center justify-center gap-2 text-sm py-3"
              style={{ background: 'rgba(255, 255, 255, 0.4)' }}
            >
              <BookOpen className="w-4 h-4 text-bloom-500" />
              <span>{savedResult.nickname}님의 {savedResult.type} 결과 보기</span>
            </button>
          </div>
        )}
      </div>

      <div className="mt-12 text-center text-xs text-neutral-600/70 flex flex-col gap-1">
        <p className="flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-bloom-400" /> Zero-DB: 귀하의 데이터는 로컬 브라우저에만 안전하게 저장됩니다.
        </p>
      </div>
    </div>
  );
};
export default Intro;
