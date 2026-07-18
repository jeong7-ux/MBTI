// 문항 조회·상품 필터·균형 리포트. DB(Question) → 계약 shape 변환.
import { prisma } from '@/lib/db';
import type {
  Product,
  PublicQuestion,
  AdminQuestion,
  ScoringQuestion,
  Dimension,
  Pole,
  FacetKey,
  MappingBalanceReport,
  QuestionFormat,
} from '@contract';
import { PRODUCT_ITEM_COUNT } from '@contract';

const DIMS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];

/** 현행 문항세트 버전(최댓값). 미지정 조회 시 사용. */
export async function currentSetVersion(): Promise<number> {
  const row = await prisma.question.findFirst({
    where: { isActive: true },
    orderBy: { questionSetVersion: 'desc' },
    select: { questionSetVersion: true },
  });
  return row?.questionSetVersion ?? 1;
}

/** 상품 세트 문항(product_tags 필터, 재현성 앵커 버전 고정). */
export async function loadQuestions(product: Product, version: number) {
  return prisma.question.findMany({
    where: { questionSetVersion: version, isActive: true, productTags: { has: product } },
    orderBy: [{ part: 'asc' }, { code: 'asc' }],
  });
}

/** 클라이언트 노출용 축약(채점 메타 제외). 계약 PublicQuestion. */
export function toPublicQuestion(q: {
  id: string; code: string; part: number; format: string; stem: string | null; textA: string; textB: string;
}): PublicQuestion {
  return {
    questionId: q.id,
    code: q.code,
    part: q.part as 1 | 2 | 3 | 4 | 5,
    format: q.format as QuestionFormat,
    stem: q.stem,
    textA: q.textA,
    textB: q.textB,
  };
}

/** 채점 순수함수 입력(극·facet 포함). 계약 ScoringQuestion. */
export function toScoringQuestion(q: {
  id: string; dimension: string; poleA: string; poleB: string; facet: string | null; facetPoleA: string | null; facetPoleB: string | null;
}): ScoringQuestion {
  return {
    questionId: q.id,
    dimension: q.dimension as Dimension,
    poleA: q.poleA as Pole,
    poleB: q.poleB as Pole,
    facet: (q.facet as FacetKey | null) ?? null,
    facetPoleA: (q.facetPoleA as Pole | null) ?? null,
    facetPoleB: (q.facetPoleB as Pole | null) ?? null,
  };
}

/** CMS 상세(계약 AdminQuestion). */
export function toAdminQuestion(q: {
  id: string; code: string; part: number; format: string; dimension: string; stem: string | null;
  textA: string; textB: string; version: number; questionSetVersion: number; poleA: string; poleB: string;
  facet: string | null; facetPoleA: string | null; facetPoleB: string | null; productTags: string[]; isActive: boolean;
}): AdminQuestion {
  return {
    questionId: q.id,
    code: q.code,
    part: q.part as 1 | 2 | 3 | 4 | 5,
    format: q.format as QuestionFormat,
    dimension: q.dimension as Dimension,
    stem: q.stem,
    textA: q.textA,
    textB: q.textB,
    version: q.version,
    questionSetVersion: q.questionSetVersion,
    poleA: q.poleA as Pole,
    poleB: q.poleB as Pole,
    facet: (q.facet as FacetKey | null) ?? null,
    facetPoleA: (q.facetPoleA as Pole | null) ?? null,
    facetPoleB: (q.facetPoleB as Pole | null) ?? null,
    productTags: q.productTags as Product[],
    isActive: q.isActive,
  };
}

/** 매핑표 균형 검증(§4.4). scripts/validate-mapping과 동일 규칙 요약(CMS 노출). */
export function balanceReport(rows: AdminQuestion[]): MappingBalanceReport {
  const products: Product[] = ['basic', 'standard', 'pro'];
  const perProduct = {} as MappingBalanceReport['perProduct'];
  let poleBalanceOk = true;
  let formatMixOk = true;
  const warnings: string[] = [];

  for (const p of products) {
    const set = rows.filter((q) => q.productTags.includes(p) && q.isActive);
    const perDimension = { EI: 0, SN: 0, TF: 0, JP: 0 } as Record<Dimension, number>;
    for (const q of set) perDimension[q.dimension] += 1;
    perProduct[p] = { total: set.length, perDimension };

    const expected = PRODUCT_ITEM_COUNT[p];
    if (set.length !== expected.total) {
      warnings.push(`${p}: 총 ${set.length}문항 (기대 ${expected.total})`);
    }
    for (const d of DIMS) {
      if (perDimension[d] !== expected.perDimension && set.length === expected.total) {
        warnings.push(`${p}/${d}: ${perDimension[d]}문항 (기대 ${expected.perDimension})`);
      }
    }
    // format 혼합 확인
    const hasSentence = set.some((q) => q.format === 'sentence');
    const hasWordPair = set.some((q) => q.format === 'word_pair');
    if (set.length > 0 && !(hasSentence && hasWordPair)) formatMixOk = false;
  }

  const unmappedFacetCount = rows.filter((q) => q.facet == null && q.isActive).length;
  if (unmappedFacetCount > 0) warnings.push(`facet 미매핑 ${unmappedFacetCount}문항 (오픈이슈 O-FACET)`);

  return { perProduct, poleBalanceOk, formatMixOk, unmappedFacetCount, warnings };
}
