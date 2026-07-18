'use client';
import type { Product } from '@contract';
import { PRODUCT_ORDER, PRODUCT_ITEM_COUNT } from '@contract';

const META: Record<Product, { label: string; sub: string }> = {
  basic: { label: '간편 검사', sub: '32문항 · 약 5분' },
  standard: { label: '일반 검사', sub: '72문항 · 약 10분' },
  pro: { label: '전문 검사', sub: '144문항 · 15~20분' },
};

/**
 * 검사 유형 전환 세그먼트 — 표준양식 tier-bar / setTier 포팅.
 * 리포트에서 상품별 노출을 미리보기(부록 D). 인쇄 시 자동 숨김(print-hide).
 */
export function TierBar({ value, owned, onChange }: { value: Product; owned: Product; onChange: (p: Product) => void }) {
  return (
    <div className="tier-bar print-hide" role="tablist" aria-label="검사 유형 전환">
      {PRODUCT_ORDER.map((p) => {
        const rank = PRODUCT_ORDER.indexOf(p);
        const ownedRank = PRODUCT_ORDER.indexOf(owned);
        const isPreview = rank > ownedRank;
        return (
          <button
            key={p}
            role="tab"
            aria-selected={value === p}
            className={value === p ? 'on' : ''}
            onClick={() => onChange(p)}
          >
            <b>{META[p].label}{isPreview ? ' 🔒' : ''}</b>
            <small>{META[p].sub} · {PRODUCT_ITEM_COUNT[p].total}문항</small>
          </button>
        );
      })}
    </div>
  );
}
