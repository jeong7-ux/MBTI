/**
 * 골든 테스트 공용 헬퍼 — 합성(synthetic) 매핑·응답 생성기 + 실 샘플 로더.
 * 합성 세트로 경계값을 정밀 제어하고, 실 매핑 샘플(24문항)로 정합성을 교차 확인한다.
 */
import type {
  Choice,
  Dimension,
  FacetKey,
  Pole,
  Product,
  ScoringAnswer,
  ScoringQuestion,
  TypeCode,
} from '@contract';
import { DIMENSIONS, POLE_LETTER } from '@scoring';

/** 지표 dim의 i번째 facet 키(EI1..EI5 round-robin). */
function facetOf(dim: Dimension, i: number): FacetKey {
  return `${dim}${(i % 5) + 1}` as FacetKey;
}

/** 단일 지표 n문항 생성(극 규약 A=L, B=R · facet round-robin). */
export function makeDimQuestions(dim: Dimension, n: number): ScoringQuestion[] {
  const out: ScoringQuestion[] = [];
  for (let i = 0; i < n; i++) {
    out.push({
      questionId: `${dim}-${i}`,
      dimension: dim,
      poleA: 'L',
      poleB: 'R',
      facet: facetOf(dim, i),
      facetPoleA: 'L',
      facetPoleB: 'R',
    });
  }
  return out;
}

/** 4지표 각 perDim문항 완전 세트. */
export function makeQuestions(perDim: number): ScoringQuestion[] {
  return DIMENSIONS.flatMap((d) => makeDimQuestions(d, perDim));
}

/**
 * 지표 dim에 대해 L측 aCount개(A), R측 bCount개(B) 응답 생성.
 * 나머지 문항은 미응답(omitted). aCount+bCount ≤ 해당 지표 문항 수.
 */
export function answersForDim(
  questions: ScoringQuestion[],
  dim: Dimension,
  aCount: number,
  bCount: number,
): ScoringAnswer[] {
  const dq = questions.filter((q) => q.dimension === dim);
  const out: ScoringAnswer[] = [];
  let idx = 0;
  for (let i = 0; i < aCount; i++, idx++) out.push({ questionId: dq[idx].questionId, choice: 'A' });
  for (let i = 0; i < bCount; i++, idx++) out.push({ questionId: dq[idx].questionId, choice: 'B' });
  return out;
}

/** 유형코드 각 글자의 극에 100% 응답(명확한 유형 산출용). */
export function answersForType(questions: ScoringQuestion[], type: TypeCode): ScoringAnswer[] {
  const out: ScoringAnswer[] = [];
  DIMENSIONS.forEach((dim, di) => {
    const letter = type[di];
    const pole: Pole = POLE_LETTER[dim].L === letter ? 'L' : 'R';
    const choice: Choice = pole === 'L' ? 'A' : 'B';
    for (const q of questions.filter((qq) => qq.dimension === dim)) {
      out.push({ questionId: q.questionId, choice });
    }
  });
  return out;
}

export const ALL_TYPES: TypeCode[] = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

/* ── 실 매핑 샘플(24문항) 로더 ── */
interface RawQuestion {
  question_id: string;
  dimension: Dimension;
  pole_a: Pole;
  pole_b: Pole;
  facet: FacetKey | null;
  facet_pole_a: Pole | null;
  facet_pole_b: Pole | null;
  product_tags: Product[];
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
import sampleJson from '../../prisma/seed-data.json';

const RAW: RawQuestion[] = (sampleJson as { questions: RawQuestion[] }).questions;

export function sampleQuestions(product: Product): ScoringQuestion[] {
  return RAW.filter((q) => q.product_tags.includes(product)).map((q) => ({
    questionId: q.question_id,
    dimension: q.dimension,
    poleA: q.pole_a,
    poleB: q.pole_b,
    facet: q.facet,
    facetPoleA: q.facet_pole_a,
    facetPoleB: q.facet_pole_b,
  }));
}
