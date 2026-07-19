// GET /api/assets?type=&gender=&variant= — 캐릭터 에셋(§6.4).
// 계약: AssetsQuery → AssetsResponse (= CharacterAsset[])
import { prisma } from '@/lib/db';
import { ok, route } from '@/lib/http';
import { dbAssetToContract } from '@/lib/serializers';
import type { AssetsResponse } from '@contract';

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');
  const gender = url.searchParams.get('gender');
  const variant = url.searchParams.get('variant');

  const rows = await prisma.characterAsset.findMany({
    where: {
      ...(type ? { typeCode: type } : {}),
      ...(gender === 'M' || gender === 'F' ? { gender } : {}),
      ...(variant === 'card' || variant === 'avatar' || variant === 'og' ? { variant } : {}),
    },
    orderBy: [{ typeCode: 'asc' }, { gender: 'asc' }, { variant: 'asc' }],
  });

  const body: AssetsResponse = rows.map(dbAssetToContract);
  return ok(body); // 계약: 배열 그대로(비래핑)
});
