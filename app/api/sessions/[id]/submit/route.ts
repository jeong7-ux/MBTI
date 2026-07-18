// POST /api/sessions/:id/submit — 채점 실행(scoring 호출→Result 영속화, <500ms 목표).
// 계약: SubmitResponse (lib/contract §4)
// 경계: 채점 수식 재구현 금지 — @/lib/scoring(=엔진 어댑터) 호출만.
import { prisma } from '@/lib/db';
import { ok, ERR } from '@/lib/http';
import { newResultToken } from '@/lib/token';
import { logAccess, getActor, clientIp } from '@/lib/auth';
import { loadQuestions, toScoringQuestion } from '@/lib/questions';
import { score, SCORING_IS_MOCK } from '@/lib/scoring';
import { buildResult, dbResultToContract } from '@/lib/serializers';
import type { SubmitResponse, ScoringInput, ScoringAnswer, Choice } from '@contract';
import { PRODUCT_ITEM_COUNT } from '@contract';
import { Prisma } from '@prisma/client';

// 계약 인터페이스(인덱스 시그니처 없음)를 Prisma Json 입력으로 안전 캐스팅.
const asJson = (v: unknown) => v as unknown as Prisma.InputJsonValue;

const REPORT_VERSION = 1; // 리포트 콘텐츠 버전 스냅샷(F-31). 콘텐츠 배포 버전과 연동 예정.

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  const session = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: { responses: true, result: true },
  });
  if (!session) return ERR.SESSION_NOT_FOUND(sessionId);

  // 재채점 방지 — 이미 채점됐으면 기존 결과 반환(멱등).
  if (session.result && session.resultToken) {
    const existing = dbResultToContract(
      { ...session.result, sessionId },
      session.resultToken,
      session.avatarVersion,
    );
    return ok<SubmitResponse>({ result: existing, redirectUrl: `/result/${session.resultToken}` });
  }

  // 재현성(F-30): 응답 시점 questionSetVersion으로 문항 세트 고정.
  const setQuestions = await loadQuestions(session.product, session.questionSetVersion);
  const total = PRODUCT_ITEM_COUNT[session.product].total;

  // 전항 응답 강제(강제선택형). 미응답은 채점 시 omitted로 반영되나, 제출 게이트는 완주 요구.
  if (session.responses.length < total) {
    return ERR.INCOMPLETE_RESPONSES({ answered: session.responses.length, total });
  }

  const scoringInput: ScoringInput = {
    product: session.product,
    questions: setQuestions.map(toScoringQuestion),
    answers: session.responses.map<ScoringAnswer>((r) => ({
      questionId: r.questionId,
      choice: r.choice as Choice,
    })),
  };

  // ⚠️ 채점: 엔진 어댑터 호출(현재 목). 엔진 연결 시 결과값만 교체되며 shape 불변.
  const output = score(scoringInput);

  const resultToken = newResultToken();
  const scoredAt = new Date();

  await prisma.$transaction([
    prisma.result.create({
      data: {
        sessionId,
        typeCode: output.typeCode,
        product: session.product,
        scores: asJson(output.scores),
        clarity: asJson(output.clarity),
        functionStack: asJson(output.functionStack),
        facets: output.facets ? asJson(output.facets) : Prisma.JsonNull, // basic/standard=null
        clarityIndex: output.clarityIndex,
        omittedCount: output.omittedCount,
        tieBreakApplied: asJson(output.tieBreakApplied),
        reportVersion: REPORT_VERSION,
        scoredAt,
      },
    }),
    prisma.testSession.update({
      where: { id: sessionId },
      data: { resultToken, status: 'completed', completedAt: scoredAt },
    }),
  ]);

  await logAccess({
    action: 'result.create', targetType: 'result', targetId: resultToken,
    actorId: getActor(req).userId, ip: clientIp(req),
  });

  const result = buildResult({
    output, resultToken, sessionId,
    product: session.product, avatarVersion: session.avatarVersion,
    reportVersion: REPORT_VERSION, scoredAt,
  });

  const body: SubmitResponse = {
    result,
    redirectUrl: `/result/${resultToken}`,
  };
  return ok(body, { headers: SCORING_IS_MOCK ? { 'x-scoring': 'mock' } : {} });
}
