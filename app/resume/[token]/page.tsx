'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getResumeState } from '@/lib/api';

/** 재개 링크 (F-04, §9) — 재개 토큰으로 세션 상태를 조회해 마지막 문항으로 복귀. */
export default function ResumePage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const st = await getResumeState(decodeURIComponent(String(token)));
        if (!alive) return;
        if (st.status === 'completed') { router.replace('/mypage'); return; }
        const q = new URLSearchParams({ product: st.product, version: st.avatarVersion, resume: decodeURIComponent(String(token)) });
        router.replace(`/test/${encodeURIComponent(st.sessionId)}?${q.toString()}`);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : '재개 정보를 불러오지 못했습니다.');
      }
    })();
    return () => { alive = false; };
  }, [token, router]);

  return (
    <div className="wrap" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        {error ? (
          <>
            <div className="note" style={{ background: 'var(--red-soft)', color: 'var(--red-deep)' }}>{error}</div>
            <Link className="btn btn-primary" href="/select">새 검사 시작</Link>
          </>
        ) : (
          <p className="sec-sub" style={{ margin: 0 }}>이어서 할 문항으로 이동 중이에요…</p>
        )}
      </div>
    </div>
  );
}
