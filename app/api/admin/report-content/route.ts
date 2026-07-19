// GET/PUT /api/admin/report-content — 리포트 콘텐츠 16유형×블록 CRUD(F-31).
// 계약: AdminReportContentListResponse / AdminReportContentUpsertRequest (lib/contract §4)
import { prisma } from '@/lib/db';
import { ok, parseBody, route } from '@/lib/http';
import { adminContentSchema } from '@/lib/validation';
import { dbContentToContract } from '@/lib/serializers';
import type { AdminReportContentListResponse, Product } from '@contract';
import { Prisma } from '@prisma/client';

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const typeCode = url.searchParams.get('type');
  const rows = await prisma.reportContent.findMany({
    where: { ...(typeCode ? { typeCode } : {}) },
    orderBy: [{ typeCode: 'asc' }, { blockKey: 'asc' }, { version: 'desc' }],
  });
  const body: AdminReportContentListResponse = rows.map(dbContentToContract);
  return ok(body); // 배열 그대로(비래핑)
});

export const PUT = route(async (req: Request) => {
  const parsed = await parseBody(req, adminContentSchema);
  if ('res' in parsed) return parsed.res;
  const b = parsed.data.block;

  // UNIQUE(typeCode, blockKey, facetKey, version). facetKey가 nullable이라
  // 복합키 whereUnique가 null을 못 받으므로 findFirst→create/update로 upsert.
  const body = b.body as Prisma.InputJsonValue;
  const existing = await prisma.reportContent.findFirst({
    where: { typeCode: b.typeCode, blockKey: b.blockKey, facetKey: b.facetKey, version: b.version },
  });
  const saved = existing
    ? await prisma.reportContent.update({
        where: { id: existing.id },
        data: { body, minProduct: b.minProduct as Product },
      })
    : await prisma.reportContent.create({
        data: {
          typeCode: b.typeCode,
          blockKey: b.blockKey,
          facetKey: b.facetKey,
          body,
          minProduct: b.minProduct as Product,
          version: b.version,
        },
      });
  return ok(dbContentToContract(saved));
});
