// DELETE /api/me/data — 내 데이터 완전 삭제(셀프서비스, F-23·§10).
// 계약: DeleteMyDataResponse (lib/contract §4)
// User soft-delete + TestSession/Response/Result hard-delete(cascade). 비식별 집계만 잔존.
import { prisma } from '@/lib/db';
import { ok, ERR, route } from '@/lib/http';
import { getActor, logAccess, clientIp } from '@/lib/auth';

export const DELETE = route(async (req: Request) => {
  const actor = getActor(req);
  if (!actor.userId) return ERR.UNAUTHORIZED();
  const userId = actor.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return ERR.UNAUTHORIZED();

  const deletionReq = await prisma.dataDeletionRequest.create({ data: { userId } });

  await prisma.$transaction(async (tx) => {
    // 세션 하위(Response/Result)는 스키마 onDelete: Cascade로 함께 삭제.
    await tx.testSession.deleteMany({ where: { userId } });
    // 인증 아이덴티티·동의 기록 삭제.
    await tx.authIdentity.deleteMany({ where: { userId } });
    // User soft-delete + 식별정보 익명화(이메일 등 제거).
    await tx.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), email: null },
    });
    await tx.dataDeletionRequest.update({
      where: { id: deletionReq.id },
      data: { completedAt: new Date() },
    });
  });

  await logAccess({
    action: 'data.delete', targetType: 'user', targetId: userId,
    actorId: userId, ip: clientIp(req),
  });

  return ok({ ok: true as const, deletionRequestId: deletionReq.id });
});
