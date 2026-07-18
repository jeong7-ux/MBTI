// POST /api/sessions/:id/upgrade — 이어하기 승급(basic/standard→상위). 기존 응답 재사용.
// 계약: UpgradeSessionRequest → UpgradeSessionResponse (lib/contract §4)
// ADR-3: product_tags 포함관계(basic⊂standard⊂pro)로 기존 응답 재사용, 잔여만 응답.
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody } from '@/lib/http';
import { newResumeToken } from '@/lib/token';
import { upgradeSchema } from '@/lib/validation';
import { loadQuestions } from '@/lib/questions';
import type { UpgradeSessionResponse } from '@contract';
import { PRODUCT_ORDER } from '@contract';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  const parsed = await parseBody(req, upgradeSchema);
  if ('res' in parsed) return parsed.res;
  const { toProduct } = parsed.data;

  const source = await prisma.testSession.findUnique({
    where: { id: sessionId },
    include: { responses: true },
  });
  if (!source) return ERR.SESSION_NOT_FOUND(sessionId);

  // 상위 상품으로만 승급 가능(포함관계 방향).
  const fromRank = PRODUCT_ORDER.indexOf(source.product);
  const toRank = PRODUCT_ORDER.indexOf(toProduct);
  if (toRank <= fromRank) {
    return ERR.INVALID_UPGRADE({ from: source.product, to: toProduct });
  }

  // 승급 세션 신규 생성(체인 기록). 기존 응답을 그대로 복사(재사용).
  const upgraded = await prisma.testSession.create({
    data: {
      userId: source.userId,
      resumeToken: newResumeToken(),
      product: toProduct,
      avatarVersion: source.avatarVersion,
      questionSetVersion: source.questionSetVersion,
      upgradedFromSessionId: source.id,
      deviceFingerprint: source.deviceFingerprint,
      expiresAt: source.expiresAt,
      responses: {
        create: source.responses.map((r) => ({
          questionId: r.questionId,
          choice: r.choice,
          elapsedMs: r.elapsedMs,
          revisedCount: r.revisedCount,
        })),
      },
    },
    include: { responses: { select: { questionId: true } } },
  });

  const reusedCount = upgraded.responses.length;
  const answeredIds = new Set(upgraded.responses.map((r) => r.questionId));

  // 잔여 = 상위 세트 − 기존 세트. 첫 미응답 문항 반환.
  const targetSet = await loadQuestions(toProduct, source.questionSetVersion);
  const remainingQs = targetSet.filter((q) => !answeredIds.has(q.id));
  const next = remainingQs[0];

  const body: UpgradeSessionResponse = {
    sessionId: upgraded.id,
    resumeToken: upgraded.resumeToken,
    product: toProduct,
    reusedCount,
    remaining: remainingQs.length,
    nextQuestionId: next ? next.id : null,
  };
  return ok(body, { status: 201 });
}
