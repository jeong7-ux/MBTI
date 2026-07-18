'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PublicQuestion, Choice, Product, AvatarVersion } from '@contract';
import { getQuestions, saveResponses, submitSession } from '@/lib/api';
import { backupAnswer, loadAnswers, saveLastResume } from '@/lib/storage';

export interface TestSessionState {
  loading: boolean;
  error: string | null;
  questions: PublicQuestion[];
  total: number;
  index: number;
  answers: Record<string, Choice>;
  answeredCount: number;
  current: PublicQuestion | null;
  syncing: boolean;
  offlineQueued: boolean;
}

/**
 * 검사 세션 오케스트레이션 (F-02~05).
 *  - 문항 로드(상품별) · 로컬 백업 복원(이어하기)
 *  - 응답: 로컬 IndexedDB 즉시 백업 + 서버 저장(실패 시 큐 유지) · 첫직관(수정 허용, 일괄검토 없음)
 *  - 선택 즉시 이동은 페이지가 처리(전환 지연 0)
 */
export function useTestSession(opts: {
  sessionId: string;
  product: Product;
  avatarVersion: AvatarVersion;
  resumeToken?: string;
}) {
  const { sessionId, product, resumeToken } = opts;
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Choice>>({});
  const [syncing, setSyncing] = useState(false);
  const [offlineQueued, setOfflineQueued] = useState(false);
  const questionShownAt = useRef<number>(Date.now());

  // 문항 로드 + 로컬 백업 복원
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getQuestions(product);
        if (!alive) return;
        setQuestions(res.questions);
        setTotal(res.total);
        const local = await loadAnswers(sessionId);
        if (!alive) return;
        const restored: Record<string, Choice> = {};
        for (const [qid, rec] of Object.entries(local)) restored[qid] = rec.choice;
        setAnswers(restored);
        // 마지막 미응답 문항으로 복귀(재개)
        const firstUnanswered = res.questions.findIndex((q) => !restored[q.questionId]);
        setIndex(firstUnanswered === -1 ? Math.max(0, res.questions.length - 1) : firstUnanswered);
        if (resumeToken) saveLastResume(resumeToken);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : '문항을 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [sessionId, product, resumeToken]);

  useEffect(() => { questionShownAt.current = Date.now(); }, [index]);

  const answeredCount = Object.keys(answers).length;
  const current = questions[index] ?? null;

  /** 현재 문항 응답 기록(로컬 즉시 백업 + 서버 저장). */
  const select = useCallback(async (questionId: string, choice: Choice) => {
    const elapsedMs = Date.now() - questionShownAt.current;
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
    // 로컬 우선 백업(유실 방지) — 서버 성공 여부와 무관
    await backupAnswer(sessionId, questionId, choice, false, elapsedMs);
    setSyncing(true);
    try {
      await saveResponses(sessionId, { answers: [{ questionId, choice, elapsedMs }] });
      await backupAnswer(sessionId, questionId, choice, true, elapsedMs);
      setOfflineQueued(false);
    } catch {
      setOfflineQueued(true); // 큐에 남김 — 재전송 대상
    } finally {
      setSyncing(false);
    }
  }, [sessionId]);

  const goTo = useCallback((i: number) => setIndex((prev) => Math.min(Math.max(0, i), Math.max(0, questions.length - 1))), [questions.length]);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, questions.length - 1)), [questions.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  const submit = useCallback(() => submitSession(sessionId), [sessionId]);

  const state: TestSessionState = {
    loading, error, questions, total, index, answers, answeredCount, current, syncing, offlineQueued,
  };
  return { ...state, select, goTo, next, prev, submit, setIndex };
}
