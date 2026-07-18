// GET /api/results/:resultToken — 결과 조회(추측 불가 토큰, F-15 공개 범위).
// 계약: ResultViewResponse (lib/contract §4)
// sections는 서버가 SECTION_MATRIX로 계산(프론트 임의 해석 금지, ADR-2).
import { prisma } from '@/lib/db';
import { ok, ERR } from '@/lib/http';
import { computeSectionVisibility } from '@/lib/sections';
import { dbResultToContract, dbContentToContract, dbAssetToContract } from '@/lib/serializers';
import { canViewResultDetail, getActor, logAccess, clientIp } from '@/lib/auth';
import { PRODUCT_ORDER } from '@contract';
import type { ResultViewResponse } from '@contract';

export async function GET(req: Request, { params }: { params: { resultToken: string } }) {
  const { resultToken } = params;
  const session = await prisma.testSession.findUnique({
    where: { resultToken },
    include: { result: true },
  });
  if (!session || !session.result) return ERR.RESULT_NOT_FOUND();

  // F-15 공개 범위: 소유자 있으면 본인만 상세. 비로그인 검사는 토큰 소지자.
  const actor = getActor(req);
  if (!canViewResultDetail(session.userId, actor.userId)) return ERR.UNAUTHORIZED();

  await logAccess({
    action: 'result.view', targetType: 'result', targetId: resultToken,
    actorId: actor.userId, ip: clientIp(req),
  });

  const result = dbResultToContract(
    { ...session.result, sessionId: session.id },
    resultToken,
    session.avatarVersion,
  );

  // 콘텐츠: minProduct ≤ result.product 인 published 블록만 서버 필터.
  const productRank = PRODUCT_ORDER.indexOf(result.product);
  const contentRows = await prisma.reportContent.findMany({
    where: { typeCode: result.typeCode, status: 'published' },
  });
  const content = contentRows
    .filter((c) => PRODUCT_ORDER.indexOf(c.minProduct) <= productRank)
    .map(dbContentToContract);

  // 에셋: 해당 유형 × 선택 성별.
  const assetRows = await prisma.characterAsset.findMany({
    where: { typeCode: result.typeCode, gender: session.avatarVersion },
  });
  const assets = assetRows.map(dbAssetToContract);

  const body: ResultViewResponse = {
    result,
    content,
    assets,
    sections: computeSectionVisibility(result.product),
  };
  return ok(body);
}
