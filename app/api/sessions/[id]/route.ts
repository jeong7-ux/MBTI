// GET /api/sessions/:token — 이어하기 상태 조회(F-04). [id] 세그먼트 = resumeToken.
// 계약: ResumeStateResponse (lib/contract §4)
import { prisma } from '@/lib/db';
import { ok, ERR } from '@/lib/http';
import { logAccess, getActor, clientIp } from '@/lib/auth';
import { loadQuestions } from '@/lib/questions';
import type { ResumeStateResponse, SessionStatus } from '@contract';
import { PRODUCT_ITEM_COUNT } from '@contract';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const resumeToken = params.id; // GET은 추측 불가 resumeToken으로 조회(계약 :token)
  const session = await prisma.testSession.findUnique({
    where: { resumeToken },
    include: { responses: { select: { questionId: true } } },
  });
  if (!session) return ERR.SESSION_NOT_FOUND();

  await logAccess({
    action: 'session.resume', targetType: 'session', targetId: session.id,
    actorId: getActor(req).userId, ip: clientIp(req),
  });

  const total = PRODUCT_ITEM_COUNT[session.product].total;
  const answeredIds = new Set(session.responses.map((r) => r.questionId));

  // 재개 시 미응답 추적(F-04): 상품 세트에서 첫 미응답 문항.
  const setQuestions = await loadQuestions(session.product, session.questionSetVersion);
  const next = setQuestions.find((q) => !answeredIds.has(q.id));

  const body: ResumeStateResponse = {
    sessionId: session.id,
    product: session.product,
    avatarVersion: session.avatarVersion,
    answered: answeredIds.size,
    total,
    nextQuestionId: next ? next.id : null, // null = 전항 응답 완료
    status: session.status as SessionStatus,
  };
  return ok(body);
}
