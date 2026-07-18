/**
 * 채점·분석 엔진 (순수 함수) — 마인드타입
 * 소유: scoring-engineer · 계약: lib/contract (ScoreFn/ScoringInput/ScoringOutput)
 *
 * 순수성: DB·네트워크·시간(Date/random)에 의존하지 않는다. 매핑표는 input.questions로 주입(하드코딩 금지).
 * 동일 입력 → 동일 출력(결정론). backend가 이 출력을 그대로 Result로 영속화한다.
 *
 * 파이프라인(§5.1~5.3, §4.5):
 *  1) 원점수 집계  2) 유형 판정(+동점 규칙 R)  3) 선호 명확도(비율 band + 상품 스케일 score)
 *  4) 심리기능 위계(FUNCTION_STACK 조회)  5) 다면척도 facets(pro 전용)  6) 무응답 omittedCount
 */
import type {
  Clarity,
  ClarityBand,
  ClarityEntry,
  Dimension,
  DimensionScores,
  FacetEntry,
  FacetKey,
  Facets,
  FacetZone,
  Pole,
  Product,
  ScoreFn,
  ScoringInput,
  ScoringOutput,
  TypeCode,
} from '../../lib/contract';
import {
  CLARITY_BANDS,
  DIMENSIONS,
  FACET_KEYS,
  FUNCTION_STACK,
  POLE_LETTER,
  TIE_BREAK_POLE,
  TIER_SCALE,
  facetDimension,
} from './constants';

export * from './constants';

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));

/** 다수극 응답 비율(percent 0..100) → 명확도 밴드(§5.2). CLARITY_BANDS는 내림차순 정렬 전제. */
export function bandForPercent(percent: number): ClarityBand {
  for (const b of CLARITY_BANDS) {
    if (percent >= b.minPercent) return b.band;
  }
  // percent<50은 이론상 없음(항상 다수극 기준). 방어적으로 최저 밴드 반환.
  return CLARITY_BANDS[CLARITY_BANDS.length - 1].band;
}

/**
 * 선호 분명도 지수(그래프 score). 상품 스케일 상한(basic 8 / standard 18 / pro 30)으로 정규화.
 * score = round((percent-50)/50 × max), 0..max. band(비율)와 별개 척도(ADR-8, 병기).
 */
export function clarityScoreIndex(percent: number, product: Product): number {
  const max = TIER_SCALE[product].max;
  return clamp(Math.round(((percent - 50) / 50) * max), 0, max);
}

/** basic 분명도 '참고용·단정 금지' 플래그(§4.5 ①). 계약 TIER_SCALE.clarityAdvisory 파생값. */
export function clarityAdvisory(product: Product): boolean {
  return TIER_SCALE[product].clarityAdvisory;
}

/**
 * 채점 순수함수. 계약 ScoreFn 시그니처 구현.
 * questions는 상품 세트로 이미 필터된 매핑표(극·facet 포함). answers는 (questionId,choice).
 */
export const score: ScoreFn = (input: ScoringInput): ScoringOutput => {
  const { product, questions, answers } = input;

  const qById = new Map(questions.map((q) => [q.questionId, q]));

  // ── 1. 원점수 집계 (지표별 L/R 누적) + facet 극 집계 ──
  const dimCount: Record<Dimension, { L: number; R: number }> = {
    EI: { L: 0, R: 0 },
    SN: { L: 0, R: 0 },
    TF: { L: 0, R: 0 },
    JP: { L: 0, R: 0 },
  };
  const facetCount = new Map<FacetKey, { L: number; R: number; total: number }>();
  const answeredIds = new Set<string>();

  for (const ans of answers) {
    const q = qById.get(ans.questionId);
    if (!q) continue; // 세트 밖 응답은 무시(멱등·재개 안전)
    if (answeredIds.has(q.questionId)) continue; // 중복 응답 방어(첫 응답 채택)
    answeredIds.add(q.questionId);

    // 극: A→poleA(항상 L), B→poleB(항상 R). 하드코딩 대신 매핑값 사용(SSOT 준수).
    const pole: Pole = ans.choice === 'A' ? q.poleA : q.poleB;
    dimCount[q.dimension][pole] += 1;

    // facet 극 집계(존재 시)
    if (q.facet) {
      const fp: Pole | null = ans.choice === 'A' ? q.facetPoleA : q.facetPoleB;
      if (fp) {
        const acc = facetCount.get(q.facet) ?? { L: 0, R: 0, total: 0 };
        acc[fp] += 1;
        acc.total += 1;
        facetCount.set(q.facet, acc);
      }
    }
  }

  // ── 2. 원점수 객체 ──
  const scores: DimensionScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const dim of DIMENSIONS) {
    scores[POLE_LETTER[dim].L] = dimCount[dim].L;
    scores[POLE_LETTER[dim].R] = dimCount[dim].R;
  }

  // ── 3. 유형 판정 + 동점 규칙 + 선호 명확도 ──
  let typeCode = '';
  const tieBreakApplied: Dimension[] = [];
  const clarity = {} as Clarity;

  for (const dim of DIMENSIONS) {
    const { L, R } = dimCount[dim];
    let winnerPole: Pole;
    if (L > R) {
      winnerPole = 'L';
    } else if (R > L) {
      winnerPole = 'R';
    } else {
      // 동점(정확 50:50 또는 0:0) → I/N/F/P('R') 채택(§5.1-4). 투명 고지.
      winnerPole = TIE_BREAK_POLE[dim];
      tieBreakApplied.push(dim);
    }
    typeCode += POLE_LETTER[dim][winnerPole];

    const total = L + R;
    const winnerCount = winnerPole === 'L' ? L : R;
    const percent = total > 0 ? Math.round((winnerCount / total) * 100) : 50;
    const entry: ClarityEntry = {
      pole: winnerPole,
      score: clarityScoreIndex(percent, product),
      band: bandForPercent(percent),
      percent,
    };
    clarity[dim] = entry;
  }

  const finalType = typeCode as TypeCode;

  // ── 4. 심리기능 위계 (내장표 조회, ADR-5) ──
  const functionStack = FUNCTION_STACK[finalType];

  // ── 5. 다면척도 facets (pro 전용) + 일관성 지수 ──
  let facets: Facets | null = null;
  let clarityIndex: number | null = null;
  if (product === 'pro') {
    facets = buildFacets(facetCount, clarity);
    clarityIndex = computeClarityIndex(clarity);
  }

  // ── 6. 무응답 ──
  const omittedCount = questions.length - answeredIds.size;

  return {
    typeCode: finalType,
    scores,
    clarity,
    functionStack,
    facets,
    clarityIndex,
    omittedCount,
    tieBreakApplied,
  };
};

/**
 * 다면척도 20종 산출(ADR-1 · 매핑 R-2). pro 전용.
 * score = round(|R−L| / facet문항수 × 5) ∈ 0..5, side = 우세측(동점 시 'R' 편향, §5.1 일관).
 * zone: score 0 → midrange, side==지표선호극 → in_pref, 반대 → out_pref.
 * 실 facet 매핑 부재분은 목데이터/부분 세트로 0점(midrange) 처리(오픈이슈 O-FACET).
 */
export function buildFacets(
  facetCount: Map<FacetKey, { L: number; R: number; total: number }>,
  clarity: Clarity,
): Facets {
  const facets = {} as Facets;
  for (const key of FACET_KEYS) {
    const acc = facetCount.get(key) ?? { L: 0, R: 0, total: 0 };
    const { L, R, total } = acc;

    let side: Pole;
    if (R > L) side = 'R';
    else if (L > R) side = 'L';
    else side = TIE_BREAK_POLE[facetDimension(key)]; // 동점/무응답 → 'R'

    const denom = total > 0 ? total : 1;
    const raw = Math.round((Math.abs(R - L) / denom) * 5);
    const facetScore = clamp(raw, 0, 5) as FacetEntry['score'];

    let zone: FacetZone;
    if (facetScore === 0) {
      zone = 'midrange';
    } else {
      const dimWinner = clarity[facetDimension(key)].pole;
      zone = side === dimWinner ? 'in_pref' : 'out_pref';
    }

    facets[key] = { side, score: facetScore, zone };
  }
  return facets;
}

/**
 * 일관성 지수(0~100, pro). 4지표 정규화 명확도(percent 50→0, 100→100)의 평균.
 * PRD가 수치식을 명시하지 않아 scoring 소유 정규화식으로 확정(오픈이슈 없음, 문서화).
 */
export function computeClarityIndex(clarity: Clarity): number {
  const sum = DIMENSIONS.reduce(
    (a, d) => a + clamp((clarity[d].percent - 50) * 2, 0, 100),
    0,
  );
  return Math.round(sum / DIMENSIONS.length);
}

export default score;
