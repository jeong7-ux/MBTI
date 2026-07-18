// POST /api/consent — 개인정보 동의(필수/선택 분리, F-22).
// 계약: ConsentRequest → ConsentResponse (lib/contract §4)
import { prisma } from '@/lib/db';
import { ok, parseBody } from '@/lib/http';
import { consentSchema } from '@/lib/validation';
import type { ConsentResponse } from '@contract';

export async function POST(req: Request) {
  const parsed = await parseBody(req, consentSchema);
  if ('res' in parsed) return parsed.res;
  const { purpose, granted, sessionId, userId, version } = parsed.data;

  // 필수(service_required)/선택(marketing) 분리 기록. 비로그인은 sessionId로 귀속.
  await prisma.consentRecord.create({
    data: {
      userId: userId ?? null,
      sessionId: sessionId ?? null,
      purpose,
      granted,
      version,
    },
  });

  const body: ConsentResponse = { ok: true };
  return ok(body);
}
