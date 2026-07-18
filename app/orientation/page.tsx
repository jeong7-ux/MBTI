'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product, AvatarVersion } from '@contract';
import { PRODUCT_ITEM_COUNT } from '@contract';
import { ORIENTATION_PRINCIPLES } from '@/components/test/HelpModal';
import { createSession, upgradeSession } from '@/lib/api';
import { saveLastResume } from '@/lib/storage';

/** 오리엔테이션 (F-01) — 응답 5원칙 필수 확인 후 시작. 첫 직관 원칙 고지. */
function OrientationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const product = (params.get('product') as Product) ?? 'standard';
  const version = (params.get('version') as AvatarVersion) ?? 'F';
  const upgradeFrom = params.get('upgradeFrom');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = PRODUCT_ITEM_COUNT[product].total;

  const start = async () => {
    if (!agreed || busy) return;
    setBusy(true); setError(null);
    try {
      const res = upgradeFrom
        ? await upgradeSession(upgradeFrom, { toProduct: product })
        : await createSession({ product, avatarVersion: version });
      saveLastResume(res.resumeToken);
      const q = new URLSearchParams({ product, version, resume: res.resumeToken });
      router.push(`/test/${encodeURIComponent(res.sessionId)}?${q.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '세션을 시작하지 못했습니다.');
      setBusy(false);
    }
  };

  return (
    <div className="wrap">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>오리엔테이션</small></h1></Link>
        <Link className="ver" href="/version">← 버전</Link>
      </div>

      <section className="card">
        <div className="eyebrow">BEFORE YOU START</div>
        <h2 className="sec">응답 전에 꼭 확인해주세요</h2>
        <p className="sec-sub">아래 5가지 원칙을 지키면 결과가 더 정확해집니다. 총 {total}문항입니다.</p>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 8 }}>
          {ORIENTATION_PRINCIPLES.map((p, i) => (
            <li key={i} className="note" style={{ marginTop: 0, display: 'flex', gap: 10 }}>
              <b style={{ color: 'var(--pine)' }}>{i + 1}</b><span>{p}</span>
            </li>
          ))}
        </ul>

        <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16, cursor: 'pointer', fontSize: '.9rem', fontWeight: 700 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: 20, height: 20 }} />
          위 5가지 응답 원칙을 확인했습니다.
        </label>

        {error && <div className="note" style={{ background: 'var(--red-soft)', color: 'var(--red-deep)' }}>{error}</div>}

        <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={!agreed || busy} onClick={start}>
          {busy ? '준비 중…' : upgradeFrom ? '승급하여 이어서 시작' : '검사 시작하기'}
        </button>
        <div className="note">일괄 검토 화면 없이 첫 직관대로 진행합니다. 이전 문항 수정은 언제든 가능해요.</div>
      </section>
    </div>
  );
}

export default function OrientationPage() {
  return (
    <Suspense fallback={<div className="wrap"><div className="card">불러오는 중…</div></div>}>
      <OrientationInner />
    </Suspense>
  );
}
