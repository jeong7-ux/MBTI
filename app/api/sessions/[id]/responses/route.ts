// PUT /api/sessions/:id/responses — 문항 응답 저장(멱등 upsert, 단건/배치 겸용).
// 계약: SaveResponsesRequest → SaveResponsesResponse (lib/contract §4)
// 멱등(ADR-7): (sessionId, questionId) upsert. 로컬 큐 재전송·수정이 중복을 만들지 않음.
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody } from '@/lib/http';
import { saveResponsesSchema } from '@/lib/validation';
import type { SaveResponsesResponse } from '@contract';
import { PRODUCT_ITEM_COUNT } from '@contract';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;
  const parsed = await parseBody(req, saveResponsesSchema);
  if ('res' in parsed) return parsed.res;
  const { answers } = parsed.data;

  const session = await prisma.testSession.findUnique({ where: { id: sessionId } });
  if (!session) return ERR.SESSION_NOT_FOUND(sessionId);
  if (session.status === 'completed') return ERR.ALREADY_SCORED();

  // 멱등 저장: 각 (sessionId, questionId) upsert. 재전송해도 최신 choice로 수렴.
  await prisma.$transaction(
    answers.map((a) =>
      prisma.response.upsert({
        where: { sessionId_questionId: { sessionId, questionId: a.questionId } },
        create: {
          sessionId,
          questionId: a.questionId,
          choice: a.choice,
          elapsedMs: a.elapsedMs ?? null,
          revisedCount: a.revisedCount ?? 0,
        },
        update: {
          choice: a.choice,
          elapsedMs: a.elapsedMs ?? null,
          // 수정 재전송 시 revisedCount 처리(F-07): 명시 값 우선, 없으면 +1 증가.
          revisedCount: a.revisedCount != null ? a.revisedCount : { increment: 1 },
        },
      }),
    ),
  );

  const answered = await prisma.response.count({ where: { sessionId } });
  const body: SaveResponsesResponse = {
    ok: true,
    saved: answers.length,
    answered,
    total: PRODUCT_ITEM_COUNT[session.product].total,
  };
  return ok(body);
}
