// GET /api/admin/session — 관리자 세션 상태 조회(프론트 마운트 시 게이트 판단용).
// 응답 shape: { authed: boolean } — 항상 200.
// ⚠️ 계약 lib/contract 외 — 하드코딩 운영 패널 전용 엔드포인트.
import { ok, route } from '@/lib/http';
import { isAuthed } from '@/lib/adminAuth';

// 쿠키 접근 — 정적 프리렌더 차단.
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  return ok({ authed: isAuthed() });
});
