// POST /api/admin/reset — 검사 데이터 초기화(파괴적, 관리자 전용).
// 응답 shape: { ok: true, deleted: { results:n, responses:n, sessions:n } }.
// 삭제 범위(정확히 이 3종): TestSession / Response / Result.
//   문항은행(Question)·User·ReportContent·CharacterAsset·AccessLog·ConsentRecord 등은 절대 미대상.
// ⚠️ 계약 lib/contract 외 — 하드코딩 운영 패널 전용 엔드포인트.
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody, route } from '@/lib/http';
import { adminResetSchema } from '@/lib/validation';
import { isAuthed } from '@/lib/adminAuth';
import { logAccess, clientIp } from '@/lib/auth';

// 쿠키 접근 — 정적 프리렌더 차단.
export const dynamic = 'force-dynamic';

export const POST = route(async (req: Request) => {
  // 1차 게이트: 관리자 인증.
  if (!isAuthed()) return ERR.ADMIN_UNAUTHORIZED();

  // 2차 가드: 서버측 확인 문구 검증(오작동 방지).
  const parsed = await parseBody(req, adminResetSchema);
  if ('res' in parsed) return parsed.res;

  // 자식→부모 순서 명시 삭제(FK cascade에 의존하지 않고 각 count 수집).
  const [results, responses, sessions] = await prisma.$transaction([
    prisma.result.deleteMany({}),
    prisma.response.deleteMany({}),
    prisma.testSession.deleteMany({}),
  ]);

  // §10 접근 로그(파괴적 운영 작업 기록). best-effort — 실패해도 흐름 비차단.
  await logAccess({
    action: 'admin.db.reset',
    targetType: 'database',
    targetId: 'sessions+responses+results',
    actorId: 'wikiman',
    ip: clientIp(req),
  });

  return ok({
    ok: true,
    deleted: {
      results: results.count,
      responses: responses.count,
      sessions: sessions.count,
    },
  });
});
