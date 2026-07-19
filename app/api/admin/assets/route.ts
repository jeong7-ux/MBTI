// GET/PUT /api/admin/assets — 캐릭터 에셋 34종·파생형 관리(F-32, §6.4).
// 계약: AdminAssetsListResponse / AdminAssetUpsertRequest (lib/contract §4)
// 네이밍 규칙 '{TYPE}_{M|F}' 검증 + 34종 누락 검사.
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody, route } from '@/lib/http';
import { adminAssetSchema } from '@/lib/validation';
import { dbAssetToContract } from '@/lib/serializers';
import type { AdminAssetsListResponse, TypeCode, AvatarVersion } from '@contract';

const TYPES: (TypeCode | 'VERSION')[] = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ', 'VERSION',
];
const GENDERS: AvatarVersion[] = ['M', 'F'];
const NAME_RE = /^(ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ|VERSION)_(M|F)$/;

function expectedName(typeCode: string, gender: string): string {
  return `${typeCode}_${gender}`;
}

// 이 라우트는 요청 시 DB를 조회한다 → 빌드 타임 정적 프리렌더 대상에서 제외
// (그렇지 않으면 next build가 DB 접속을 시도해 실패). qa 이슈-1 조치.
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const rows = await prisma.characterAsset.findMany({
    orderBy: [{ typeCode: 'asc' }, { gender: 'asc' }, { variant: 'asc' }],
  });
  const assets = rows.map(dbAssetToContract);

  // 네이밍 위반: fileName이 '{TYPE}_{M|F}' 규칙 불일치.
  const namingViolations = rows
    .filter((a) => !NAME_RE.test(a.fileName))
    .map((a) => a.fileName);

  // 34종 누락(card variant 기준: 16유형×2 + VERSION×2 = 34).
  const present = new Set(rows.filter((r) => r.variant === 'card').map((r) => `${r.typeCode}_${r.gender}`));
  const missing: string[] = [];
  for (const t of TYPES) for (const g of GENDERS) {
    const key = `${t}_${g}`;
    if (!present.has(key)) missing.push(key);
  }

  const body: AdminAssetsListResponse = { assets, namingViolations, missing };
  return ok(body);
});

export const PUT = route(async (req: Request) => {
  const parsed = await parseBody(req, adminAssetSchema);
  if ('res' in parsed) return parsed.res;
  const a = parsed.data.asset;

  // 네이밍 규칙 검증(§6.4). 위반 시 저장 거부.
  if (!NAME_RE.test(a.fileName) || a.fileName !== expectedName(a.typeCode, a.gender)) {
    return ERR.NAMING_VIOLATION({ fileName: a.fileName, expected: expectedName(a.typeCode, a.gender) });
  }

  const saved = await prisma.characterAsset.upsert({
    where: {
      typeCode_gender_variant_version: {
        typeCode: a.typeCode,
        gender: a.gender,
        variant: a.variant,
        version: a.version,
      },
    },
    create: {
      typeCode: a.typeCode,
      gender: a.gender,
      variant: a.variant,
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      altText: a.altText,
      temperament: a.temperament,
      version: a.version,
    },
    update: {
      fileUrl: a.fileUrl,
      fileName: a.fileName,
      altText: a.altText,
      temperament: a.temperament,
    },
  });
  return ok(dbAssetToContract(saved));
});
