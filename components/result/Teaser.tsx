'use client';
import { useState } from 'react';
import type { TypeCode, AvatarVersion } from '@contract';
import { CharacterPlaceholder } from '@/components/CharacterPlaceholder';
import { TYPE_NICKNAME, temperamentOf, TEMPERAMENT_LABEL, TEMPERAMENT_TINT_VAR } from '@/lib/report/typeMeta';

/** 결과 티저 (마케팅 표면) — 유형×버전 캐릭터 + 유형 코드 + 한 줄 정의 + 공유. */
export function Teaser({ type, gender, oneLiner }: { type: TypeCode; gender: AvatarVersion; oneLiner: string }) {
  const [copied, setCopied] = useState(false);
  const temp = temperamentOf(type);

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = `내 성격유형은 ${type} · ${TYPE_NICKNAME[type]}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* 취소 */ }
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };

  return (
    <section
      className="card reveal"
      style={{
        // 기질 tint 단색 위에 표준양식 라디얼 언어 1겹(코너) — 모션 무추가, 마케팅 하이라이트 격상
        backgroundColor: `var(${TEMPERAMENT_TINT_VAR[temp]})`,
        backgroundImage:
          'radial-gradient(circle at 88% -12%, rgba(255,255,255,.55) 0, transparent 46%),' +
          'radial-gradient(circle at 6% 108%, rgba(23,38,59,.05) 0, transparent 44%)',
        textAlign: 'center',
        padding: '32px 24px',
      }}
    >
      <div className="eyebrow">내 유형</div>
      <div style={{ display: 'grid', placeItems: 'center', gap: 14, margin: '10px 0' }}>
        <CharacterPlaceholder type={type} gender={gender} size={160} />
        <div>
          <div className="type-badge" style={{ display: 'inline-block' }}>{type}</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 8 }}>{TYPE_NICKNAME[type]}</div>
          <div className="chip" style={{ marginTop: 6 }}>{TEMPERAMENT_LABEL[temp]}</div>
        </div>
        <p className="sec-sub" style={{ maxWidth: '46ch', margin: 0 }}>{oneLiner}</p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }} className="print-hide">
        <button type="button" className="btn btn-primary" onClick={share}>{copied ? '링크 복사됨!' : '결과 공유하기'}</button>
        <a className="btn" href="#report">심층 리포트 보기 ↓</a>
      </div>
    </section>
  );
}
