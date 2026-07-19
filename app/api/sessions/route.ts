// POST /api/sessions — 검사 세션 시작(상품·버전 선택, 재개 토큰 발급).
// 계약: CreateSessionRequest → CreateSessionResponse (lib/contract §4)
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody, route } from '@/lib/http';
import { newResumeToken } from '@/lib/token';
import { createSessionSchema } from '@/lib/validation';
import { currentSetVersion } from '@/lib/questions';
import type { CreateSessionResponse } from '@contract';
import { PRODUCT_ITEM_COUNT } from '@contract';

export const POST = route(async (req: Request) => {
  const parsed = await parseBody(req, createSessionSchema);
  if ('res' in parsed) return parsed.res;
  const { product, avatarVersion, userId, deviceFingerprint } = parsed.data;

  const questionSetVersion = await currentSetVersion();
  // 보관기간(§10): 비로그인 기본 1년, 로그인은 탈퇴 시까지(null).
  const expiresAt = userId ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const session = await prisma.testSession.create({
    data: {
      userId: userId ?? null,
      resumeToken: newResumeToken(),
      product,
      avatarVersion, // 채점 무관·일러스트 개인화 목적(§6.1)
      questionSetVersion,
      deviceFingerprint: deviceFingerprint ?? null,
      expiresAt,
    },
  });

  const body: CreateSessionResponse = {
    sessionId: session.id,
    resumeToken: session.resumeToken,
    questionSetVersion,
    product,
    total: PRODUCT_ITEM_COUNT[product].total,
  };
  return ok(body, { status: 201 });
});
