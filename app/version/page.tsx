'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product, AvatarVersion } from '@contract';
import { saveVersionPref, loadVersionPref } from '@/lib/storage';

/** 버전 선택 카드 이미지 (public/version/VERSION_{M|F}.png · §6.4 네이밍). 남/여 동등 프레임. */
const VERSION_IMG: Record<AvatarVersion, { src: string; alt: string }> = {
  F: { src: '/version/VERSION_F.svg', alt: '여성 버전 대표 일러스트 캐릭터' },
  M: { src: '/version/VERSION_M.svg', alt: '남성 버전 대표 일러스트 캐릭터' },
};

/** 버전 선택 (F-09) — 남/여 대등, 채점 무관 상시 고지, 재방문 선택 유지. */
function VersionInner() {
  const router = useRouter();
  const params = useSearchParams();
  const product = (params.get('product') as Product) ?? 'standard';
  const upgradeFrom = params.get('upgradeFrom');
  const [prev, setPrev] = useState<AvatarVersion | null>(null);

  useEffect(() => { setPrev(loadVersionPref()); }, []);

  const choose = (v: AvatarVersion) => {
    saveVersionPref(v);
    const q = new URLSearchParams({ product, version: v });
    if (upgradeFrom) q.set('upgradeFrom', upgradeFrom);
    router.push(`/orientation?${q.toString()}`);
  };

  // 대표 캐릭터(데모): ENFP를 버스트로 노출 (동등 비중)
  const cards: { v: AvatarVersion; label: string; social: number }[] = [
    { v: 'F', label: '여성 버전', social: 1284 },
    { v: 'M', label: '남성 버전', social: 1197 },
  ];

  return (
    <div className="wrap">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>버전 선택</small></h1></Link>
        <Link className="ver" href={`/select`}>← 상품</Link>
      </div>

      <section className="card">
        <div className="eyebrow">STEP 2 · 버전 선택</div>
        <h2 className="sec">일러스트 버전을 골라주세요</h2>
        <div className="note" style={{ background: 'var(--pine-soft)', color: 'var(--pine-deep)' }}>
          <b>채점·유형 판정과 무관합니다.</b> 결과 캐릭터 일러스트의 스타일 선택일 뿐이며, 언제든 결과 화면에서 바꿀 수 있어요.
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cards.map((c) => (
          <button
            key={c.v}
            type="button"
            onClick={() => choose(c.v)}
            className="card"
            style={{ margin: 0, cursor: 'pointer', display: 'grid', gap: 12, placeItems: 'center', textAlign: 'center', border: prev === c.v ? '2px solid var(--pine)' : '1.5px solid var(--line)' }}
            aria-label={`${c.label} 선택`}
          >
            <div
              style={{
                width: 148, height: 168, borderRadius: 16, overflow: 'hidden',
                display: 'grid', placeItems: 'center', background: 'var(--pine-soft)',
                border: '1.5px solid var(--line)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={VERSION_IMG[c.v].src}
                alt={VERSION_IMG[c.v].alt}
                width={148}
                height={168}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>{c.label}{prev === c.v && ' · 이전 선택'}</div>
              <div className="token" style={{ fontSize: '.72rem' }}>최근 30일 {c.social.toLocaleString()}명 완료</div>
            </div>
            <span className="btn btn-primary btn-block" aria-hidden="true">이 버전으로</span>
          </button>
        ))}
      </div>
      <div className="note">두 버전은 포즈·크기·컬러가 동등하며 소품만 다릅니다. 성별 정보를 저장하지 않아요.</div>
    </div>
  );
}

export default function VersionPage() {
  return (
    <Suspense fallback={<div className="wrap"><div className="card">불러오는 중…</div></div>}>
      <VersionInner />
    </Suspense>
  );
}
