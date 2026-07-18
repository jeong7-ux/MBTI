'use client';
import { useEffect } from 'react';

/** 도움말 모달 (F-06, 우상단). 응답 5원칙 재열람. */
export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="검사 도움말"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(23,38,59,.45)', display: 'grid', placeItems: 'center', zIndex: 50, padding: 16 }}
    >
      <div className="card" style={{ maxWidth: 460, margin: 0 }} onClick={(e) => e.stopPropagation()}>
        <h2 className="sec">응답 안내</h2>
        <p className="sec-sub">편안하게, 첫 직관대로 응답하는 것이 가장 정확합니다.</p>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
          {ORIENTATION_PRINCIPLES.map((p, i) => (
            <li key={i} className="note" style={{ marginTop: 0 }}><b>{i + 1}.</b> {p}</li>
          ))}
        </ul>
        <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export const ORIENTATION_PRINCIPLES: string[] = [
  '정답은 없습니다. 좋고 나쁨을 판단하지 않아요.',
  '되고 싶은 모습이 아니라 평소의 나로 응답하세요.',
  '너무 오래 고민하지 말고 첫 느낌으로 고르세요.',
  '가능한 한 모든 문항에 응답하세요(중립·회피 최소화).',
  '언제든 그만두고 이어서 할 수 있습니다. 응답은 자동 저장됩니다.',
];
