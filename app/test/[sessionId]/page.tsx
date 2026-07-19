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
      // 실패 시 채점 화면을 유지하고 에러+재시도를 노출한다.
      // (과거엔 여기서 completing을 꺼 마지막 문항으로 조용히 되돌아갔다.)
      setSubmitError(e instanceof Error ? e.message : '채점 요청에 실패했습니다. 잠시 후 다시 시도하세요.');
    }
  }, [s, router]);

  const onSelect = useCallback(async (choice: Choice) => {
    const q = s.current;
    if (!q) return;
    const i = s.index;

    if (i >= s.questions.length - 1) {
      // 마지막 문항: 즉시 채점 화면으로 전환(재탭 방지·즉각 피드백)한 뒤,
      // 마지막 응답의 서버 저장 완료를 보장하고 채점 요청한다.
      // (기존엔 저장을 기다리지 않고 submit해 INCOMPLETE 409 → 문항 재노출 버그가 있었다.)
      setCompleting(true); setSubmitError(null);
      await s.select(q.questionId, choice);
      void complete();
      return;
    }

    void s.select(q.questionId, choice); // 중간 문항은 백그라운드 저장(전환 지연 0)
    const nextPart = s.questions[i + 1].part;
    if (nextPart !== q.part) setBridgeTo(i + 1);
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
        {submitError ? (
          <>
            <h2 className="sec">채점을 완료하지 못했어요</h2>
            <div className="note" style={{ background: 'var(--red-soft)', color: 'var(--red-deep)' }}>{submitError}</div>
            <button className="btn btn-primary" onClick={complete} style={{ marginTop: 12 }}>다시 시도</button>
          </>
        ) : (
          <>
            <h2 className="sec">응답을 채점하고 있어요</h2>
            <p className="sec-sub">잠시만 기다려주세요. 결과 리포트로 이동합니다.</p>
          </>
        )}
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
            {USE_MOCK && <span className="chip warn" title="개발 데모용 예시 문항 — 실 검사 아님">목 모드 · 예시 데이터</span>}
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
