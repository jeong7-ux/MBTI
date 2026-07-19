// POST /api/auth/login — 소셜(카카오·구글)+이메일 로그인. ⚠️ 스텁(실 OAuth 검증 지점 표기).
// 계약: LoginRequest → LoginResponse (lib/contract §4)
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody, route } from '@/lib/http';
import { loginSchema } from '@/lib/validation';
import type { LoginResponse } from '@contract';

export const POST = route(async (req: Request) => {
  const parsed = await parseBody(req, loginSchema);
  if ('res' in parsed) return parsed.res;
  const { provider, token, email, linkSessionId } = parsed.data;

  // TODO(인증): 실제로는 provider별 OAuth 토큰 검증(kakao/google) 또는 email 매직링크.
  //   여기서 providerUid를 신뢰 가능하게 획득해야 함. 아래는 개발/QA 스텁.
  const providerUid =
    provider === 'email'
      ? (email ?? '')
      : (token ? `stub:${provider}:${token.slice(0, 12)}` : `stub:${provider}:anon`);
  if (!providerUid) return ERR.VALIDATION({ reason: 'missing_identity' });

  // AuthIdentity 조회/생성 → User 확보.
  let identity = await prisma.authIdentity.findUnique({
    where: { provider_providerUid: { provider, providerUid } },
    include: { user: true },
  });
  if (!identity) {
    const user = await prisma.user.create({ data: { email: provider === 'email' ? email ?? null : null } });
    identity = await prisma.authIdentity.create({
      data: { userId: user.id, provider, providerUid },
      include: { user: true },
    });
  }
  const userId = identity.userId;

  // 비로그인 검사 세션을 계정에 귀속(linkSessionId, F-20).
  const linkedSessionIds: string[] = [];
  if (linkSessionId) {
    const sess = await prisma.testSession.findUnique({ where: { id: linkSessionId } });
    if (sess && !sess.userId) {
      await prisma.testSession.update({
        where: { id: linkSessionId },
        data: { userId, expiresAt: null }, // 로그인 귀속 → 보관 '탈퇴 시까지'
      });
      linkedSessionIds.push(linkSessionId);
    }
  }

  // TODO(인증): accessToken은 실제 서명 JWT/세션쿠키로 발급. 스텁 토큰.
  const body: LoginResponse = {
    userId,
    accessToken: `stub-access-${userId}`,
    linkedSessionIds,
  };
  return ok(body);
});
