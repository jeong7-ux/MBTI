// GET/PUT /api/admin/questions — 문항 매핑표 CRUD(product_tags·facet·버전, F-30).
// 계약: AdminQuestionsListResponse / AdminQuestionUpsertRequest (lib/contract §4)
// ⚠️ 관리자 인증 게이트는 스텁(TODO: role 검증).
import { prisma } from '@/lib/db';
import { ok, ERR, parseBody, route } from '@/lib/http';
import { adminQuestionSchema } from '@/lib/validation';
import { toAdminQuestion, balanceReport, currentSetVersion } from '@/lib/questions';
import type { AdminQuestionsListResponse } from '@contract';
import type { Format, Dimension, Pole, Product } from '@prisma/client';

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const versionParam = url.searchParams.get('version');
  const version = versionParam ? Number(versionParam) : await currentSetVersion();

  const rows = await prisma.question.findMany({
    where: { questionSetVersion: version },
    orderBy: [{ part: 'asc' }, { code: 'asc' }],
  });
  const questions = rows.map(toAdminQuestion);
  const body: AdminQuestionsListResponse = {
    questionSetVersion: version,
    questions,
    balance: balanceReport(questions), // §4.4 균형 검증
  };
  return ok(body);
});

export const PUT = route(async (req: Request) => {
  const parsed = await parseBody(req, adminQuestionSchema);
  if ('res' in parsed) return parsed.res;
  const q = parsed.data.question;

  // 극 규약 강제(§ pole_a=L, pole_b=R) — 어기면 전 리포트 막대 반전.
  if (q.poleA !== 'L' || q.poleB !== 'R') {
    return ERR.VALIDATION({ reason: 'pole_rule', detail: 'poleA must be L, poleB must be R' });
  }

  const saved = await prisma.question.upsert({
    where: { id: q.questionId },
    create: {
      id: q.questionId,
      code: q.code,
      part: q.part,
      format: q.format as Format,
      dimension: q.dimension as Dimension,
      poleA: q.poleA as Pole,
      poleB: q.poleB as Pole,
      textA: q.textA,
      textB: q.textB,
      stem: q.stem,
      facet: q.facet,
      facetPoleA: (q.facetPoleA as Pole | null) ?? null,
      facetPoleB: (q.facetPoleB as Pole | null) ?? null,
      productTags: q.productTags as Product[],
      version: q.version,
      questionSetVersion: q.questionSetVersion,
      isActive: q.isActive,
    },
    update: {
      code: q.code,
      part: q.part,
      format: q.format as Format,
      dimension: q.dimension as Dimension,
      poleA: q.poleA as Pole,
      poleB: q.poleB as Pole,
      textA: q.textA,
      textB: q.textB,
      stem: q.stem,
      facet: q.facet,
      facetPoleA: (q.facetPoleA as Pole | null) ?? null,
      facetPoleB: (q.facetPoleB as Pole | null) ?? null,
      productTags: q.productTags as Product[],
      version: q.version,
      questionSetVersion: q.questionSetVersion,
      isActive: q.isActive,
    },
  });

  return ok(toAdminQuestion(saved));
});
