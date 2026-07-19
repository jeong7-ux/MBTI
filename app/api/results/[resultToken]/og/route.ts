// GET /api/results/:resultToken/og — 결과 공유 OG 이미지(선택 버전 캐릭터, F-15).
// 현재 SVG 직접 서빙(image/svg+xml). PNG 변환은 렌더 인프라 결정 후 연결.
import { prisma } from '@/lib/db';
import { route } from '@/lib/http';
import { buildOgSvg } from '@/lib/og';
import type { TypeCode } from '@contract';

export const GET = route(async (_req: Request, { params }: { params: { resultToken: string } }) => {
  const { resultToken } = params;
  const session = await prisma.testSession.findUnique({
    where: { resultToken },
    include: { result: true },
  });
  if (!session || !session.result) {
    return new Response('Not found', { status: 404 });
  }
  const typeCode = session.result.typeCode as TypeCode;

  // OG 캐릭터 에셋(선택 성별) — 있으면 합성.
  const asset = await prisma.characterAsset.findFirst({
    where: { typeCode, gender: session.avatarVersion, variant: 'og' },
  });
  // 별칭(nickname) 콘텐츠 — 있으면 라벨로.
  const nick = await prisma.reportContent.findFirst({
    where: { typeCode, blockKey: 'nickname', status: 'published' },
  });
  const nickname = typeof nick?.body === 'string' ? nick.body : undefined;

  const svg = buildOgSvg({
    typeCode,
    nickname,
    gender: session.avatarVersion,
    characterUrl: asset?.fileUrl ?? null,
  });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});
