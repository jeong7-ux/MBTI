'use client';
import { Suspense, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { Product, AvatarVersion, Choice } from '@contract';
import { useTestSession } from '@/lib/hooks/useTestSession';
import { QuestionCard } from '@/components/test/QuestionCard';
import { Progress } from '@/components/test/Progress';
import { PartBridge } from '@/components/test/PartBridge';
import { HelpModal } from '@/components/test/HelpModal';
import { USE_MOCK } from '@/lib/api';

function TestInner() {
  const router = useRouter();
  const routeParams = useParams<{ sessionId: string }>();
  const search = useSearchParams();
  const sessionId = decodeURIComponent(String(routeParams.sessionId));
  const product = (search.get('product') as Product) ?? 'standard';
  const version = (search.get('version') as AvatarVersion) ?? 'F';
  const resumeToken = search.get('resume') ?? undefined;

  const s = useTestSession({ sessionId, product, avatarVersion: version, resumeToken });
  const [bridgeTo, setBridgeTo] = useState<number | null>(null);
  const [completing, setCompleting] = useState(false);
  const [help, setHelp] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const complete = useCallback(async () => {
    setCompleting(true); setSubmitError(null);
    try {
      const res = await s.submit();
      router.push(res.redirectUrl);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '채점 요청에 실패했습니다. 잠시 후 다시 시도하세요.');
      setCompleting(false);
    }
  }, [s, router]);

  const onSelect = useCallback((choice: Choice) => {
    if (!s.current) return;
    void s.select(s.current.questionId, choice); // 서버 저장은 백그라운드, 전환 지연 0
    const i = s.index;
    if (i >= s.questions.length - 1) { void complete(); return; }
    const nextPart = s.questions[i + 1].part;
    if (nextPart !== s.current.part) setBridgeTo(i + 1);
    else s.setIndex(i + 1);
  }, [s, complete]);

  if (s.loading) {
    return <CenterCard>문항을 준비하고 있어요…</CenterCard>;
  }
  if (s.error) {
    return <CenterCard><div className="note" style={{ background: 'var(--red-soft)', color: 'var(--red-deep)' }}>{s.error}</div><Link className="btn" href="/select">상품 선택으로</Link></CenterCard>;
  }
  if (completing) {
    return (
      <CenterCard>
        <h2 className="sec">응답을 채점하고 있어요</h2>
        <p className="sec-sub">잠시만 기다려주세요. 결과 리포트로 이동합니다.</p>
        {submitError && <><div className="note" style={{ background: 'var(--red-soft)', color: 'var(--red-deep)' }}>{submitError}</div><button className="btn btn-primary" onClick={complete}>다시 시도</button></>}
      </CenterCard>
    );
  }

  const part = s.current?.part ?? 1;

  return (
    <>
      <Progress part={part} answered={s.answeredCount} total={s.total} />
      <div className="wrap" style={{ paddingTop: 16 }}>
        <div className="topbar" style={{ marginBottom: 8 }}>
          <Link className="brand" href="/"><div className="logo">MT</div><h1 style={{ fontSize: '.9rem' }}>마인드타입</h1></Link>
          <div style={{ display: 'flex', gap: 8 }}>
            {s.offlineQueued && <span className="chip warn" title="오프라인 저장됨 — 자동 재전송 대기">오프라인 저장됨</span>}
            {USE_MOCK && <span className="chip info" title="backend 미연결">실 API 연결 대기</span>}
            <button type="button" className="ver" onClick={() => setHelp(true)} aria-label="도움말 열기">도움말</button>
          </div>
        </div>

        {bridgeTo !== null ? (
          <PartBridge
            nextPart={s.questions[bridgeTo].part}
            done={s.answeredCount}
            total={s.total}
            onContinue={() => { s.setIndex(bridgeTo); setBridgeTo(null); }}
          />
        ) : s.current ? (
          <>
            <QuestionCard
              key={s.current.questionId}
              question={s.current}
              value={s.answers[s.current.questionId] ?? null}
              onSelect={onSelect}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
              <button type="button" className="btn" onClick={s.prev} disabled={s.index === 0}>← 이전</button>
              <span className="note" style={{ marginTop: 0 }}>선택하면 자동으로 다음 문항으로 넘어가요. 저장은 자동입니다.</span>
              {s.answers[s.current.questionId] && s.index < s.questions.length - 1 && (
                <button type="button" className="btn" onClick={s.next}>다음 →</button>
              )}
            </div>
          </>
        ) : null}
      </div>
      <HelpModal open={help} onClose={() => setHelp(false)} />
    </>
  );
}

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="wrap" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>{children}</div>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div className="wrap"><div className="card">불러오는 중…</div></div>}>
      <TestInner />
    </Suspense>
  );
}
