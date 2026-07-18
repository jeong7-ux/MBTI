'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product } from '@contract';
import { PRODUCT_ITEM_COUNT, TIER_SCALE } from '@contract';
import { saveProductPref } from '@/lib/storage';

const PLANS: { product: Product; name: string; time: string; blurb: string; recommend?: boolean }[] = [
  { product: 'basic', name: '간편 검사', time: '약 5분', blurb: '빠른 자기확인·공유. 유형 판정과 참고용 분명도.' },
  { product: 'standard', name: '일반 검사', time: '약 10분', blurb: '자기이해·관계 참고. 종합 해설·구체적 특성·기능 위계.', recommend: true },
  { product: 'pro', name: '전문 검사', time: '15~20분', blurb: '전문 해석·상담 연계. 20개 다면척도·스트레스 반응·소견까지.' },
];

function SelectInner() {
  const router = useRouter();
  const params = useSearchParams();
  const upgradeFrom = params.get('upgradeFrom');

  const choose = (p: Product) => {
    saveProductPref(p);
    const q = new URLSearchParams({ product: p });
    if (upgradeFrom) q.set('upgradeFrom', upgradeFrom);
    router.push(`/version?${q.toString()}`);
  };

  return (
    <div className="wrap-wide">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>상품 선택</small></h1></Link>
        <Link className="ver" href="/">← 홈</Link>
      </div>

      <section className="card">
        <div className="eyebrow">STEP 1 · 상품 선택</div>
        <h2 className="sec">어떤 검사를 받으시겠어요?</h2>
        <p className="sec-sub">모두 같은 문항은행에서 균형 추출됩니다. 언제든 이어하기 승급으로 상위 검사로 확장할 수 있어요.</p>
        {upgradeFrom && (
          <div className="upsell" style={{ borderColor: 'var(--pine)', background: 'var(--pine-soft)' }}>
            <b>이어하기 승급</b>
            <p style={{ color: 'var(--pine-deep)' }}>기존 응답을 재사용하고 잔여 문항만 추가합니다. 상위 상품을 선택하세요.</p>
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, alignItems: 'stretch' }}>
        {PLANS.map((pl) => {
          const scale = TIER_SCALE[pl.product];
          return (
            <button
              key={pl.product}
              type="button"
              onClick={() => choose(pl.product)}
              className="card"
              style={{
                textAlign: 'left', cursor: 'pointer', margin: 0,
                border: pl.recommend ? '2px solid var(--pine)' : '1.5px solid var(--line)',
              }}
              aria-label={`${pl.name} 선택`}
            >
              {pl.recommend && <span className="chip" style={{ marginBottom: 8 }}>추천</span>}
              <h3 className="blk" style={{ marginTop: pl.recommend ? 4 : 0 }}>{pl.name}</h3>
              <div className="token" style={{ fontSize: '.8rem', marginBottom: 8 }}>
                {PRODUCT_ITEM_COUNT[pl.product].total}문항 · {pl.time} · 분명도 0~{scale.max}
              </div>
              <p style={{ fontSize: '.85rem', color: 'var(--sub)', minHeight: 48 }}>{pl.blurb}</p>
              <span className="btn btn-primary btn-block" style={{ marginTop: 12 }} aria-hidden="true">이 검사로 시작</span>
            </button>
          );
        })}
      </div>

      <div className="note">탭 한 번으로 다음 단계(버전 선택)로 넘어갑니다.</div>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={<div className="wrap"><div className="card">불러오는 중…</div></div>}>
      <SelectInner />
    </Suspense>
  );
}
