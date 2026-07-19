// POST /api/admin/logout — 관리자 로그아웃(mt_admin 쿠키 삭제).
// 응답 shape: { ok: true }.
// ⚠️ 계약 lib/contract 외 — 하드코딩 운영 패널 전용 엔드포인트.
import { ok, route } from '@/lib/http';
import { COOKIE_NAME, cookieOptions } from '@/lib/adminAuth';

// 쿠키 접근 — 정적 프리렌더 차단.
export const dynamic = 'force-dynamic';

export const POST = route(async () => {
  const res = ok({ ok: true });
  // maxAge:0으로 즉시 만료(동일 옵션이라야 브라우저가 같은 쿠키로 인식·삭제).
  res.cookies.set(COOKIE_NAME, '', { ...cookieOptions(), maxAge: 0 });
  return res;
});
