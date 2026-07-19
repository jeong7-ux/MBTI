// POST /api/admin/login — 관리자 로그인(하드코딩 계정, scrypt 상수시간 검증).
// 응답 shape: { ok: true } + mt_admin 서명 쿠키(httpOnly). 실패 시 INVALID_CREDENTIALS(401).
// ⚠️ 계약 lib/contract 외 — 하드코딩 운영 패널 전용 엔드포인트.
import { ok, ERR, parseBody, route } from '@/lib/http';
import { adminLoginSchema } from '@/lib/validation';
import { verifyCredentials, signSession, COOKIE_NAME, cookieOptions } from '@/lib/adminAuth';

// 쿠키 접근 — 정적 프리렌더 차단(과거 빌드 차단 버그 재발 방지).
export const dynamic = 'force-dynamic';

export const POST = route(async (req: Request) => {
  const parsed = await parseBody(req, adminLoginSchema);
  if ('res' in parsed) return parsed.res;
  const { username, password } = parsed.data;

  // 어느 필드가 틀렸는지 노출하지 않는다(단일 401).
  if (!verifyCredentials(username, password)) {
    return ERR.INVALID_CREDENTIALS();
  }

  const res = ok({ ok: true });
  res.cookies.set(COOKIE_NAME, signSession(), cookieOptions());
  return res;
});
