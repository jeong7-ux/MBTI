/**
 * 골든 유닛 테스트 — 채점 엔진 (PRD §5.1~5.3, §4.5 · R4 경계선 민원 방어선)
 * 커버: 16유형 · 동점 · 명확도 경계값(50/56/66/76%) · 상품 스케일(8/18/30)
 *        · 기능위계 이중검증 · 무응답 · 다면척도(pro 전용) · 승급 일관성.
 */
import { describe, expect, it } from 'vitest';
import type { Dimension, Product, ScoringInput, TypeCode } from '@contract';
import { CLARITY_BANDS, FUNCTION_STACK, TIER_SCALE } from '@contract';
import {
  bandForPercent,
  clarityAdvisory,
  clarityScoreIndex,
  deriveFunctionStack,
  FACET_KEYS,
  score,
} from '@scoring';
import {
  ALL_TYPES,
  answersForDim,
  answersForType,
  makeDimQuestions,
  makeQuestions,
  sampleQuestions,
} from '../testkit';

const DIMS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];

/* ══════════════════ 1. 16유형 대표 케이스 ══════════════════ */
describe('16유형 대표 응답 → 정확한 코드·기능위계', () => {
  for (const type of ALL_TYPES) {
    it(`${type}: 100% 선호 응답이 ${type}로 판정되고 기능위계 일치`, () => {
      const questions = makeQuestions(8);
      const answers = answersForType(questions, type);
      const out = score({ product: 'basic', questions, answers });

      expect(out.typeCode).toBe(type);
      expect(out.functionStack).toEqual(FUNCTION_STACK[type]);
      expect(out.tieBreakApplied).toEqual([]); // 100%는 동점 없음
      // 명확도 100% → very_clear
      for (const d of DIMS) expect(out.clarity[d].band).toBe('very_clear');
    });
  }
});

/* ══════════════════ 2. 기능위계 이중검증 (표 == 알고리즘) ══════════════════ */
describe('기능위계 이중검증 — 도출 알고리즘 == §5.3 내장표(16행 100%)', () => {
  for (const type of ALL_TYPES) {
    it(`${type}: derive == FUNCTION_STACK`, () => {
      expect(deriveFunctionStack(type)).toEqual(FUNCTION_STACK[type]);
    });
  }
  it('열등=주기능 반대, 3차=부기능 반대 (예: ISTJ Si·Te·Fi·Ne)', () => {
    expect(deriveFunctionStack('ISTJ')).toEqual({
      dominant: 'Si', auxiliary: 'Te', tertiary: 'Fi', inferior: 'Ne',
    });
  });
});

/* ══════════════════ 3. 동점 케이스 (정확 50:50 → I/N/F/P) ══════════════════ */
describe('동점 처리 — 각 지표 50:50 → R(I/N/F/P) 채택 + 투명 고지', () => {
  const rLetter: Record<Dimension, string> = { EI: 'I', SN: 'N', TF: 'F', JP: 'P' };
  for (const dim of DIMS) {
    it(`${dim} 4:4 동점 → ${rLetter[dim]} 판정 + tieBreakApplied 기록`, () => {
      const questions = makeDimQuestions(dim, 8);
      const answers = answersForDim(questions, dim, 4, 4);
      const out = score({ product: 'pro', questions, answers });

      expect(out.clarity[dim].pole).toBe('R');
      expect(out.clarity[dim].percent).toBe(50);
      expect(out.clarity[dim].band).toBe('slight');
      expect(out.tieBreakApplied).toContain(dim);
    });
  }
  it('전 지표 동점 → INFP + 4지표 모두 tieBreak', () => {
    const questions = makeQuestions(8);
    const answers = DIMS.flatMap((d) => answersForDim(questions, d, 4, 4));
    const out = score({ product: 'pro', questions, answers });
    expect(out.typeCode).toBe('INFP');
    expect(out.tieBreakApplied.sort()).toEqual([...DIMS].sort());
  });
  it('무응답(0:0)도 동점으로 R 채택', () => {
    const questions = makeQuestions(8);
    const out = score({ product: 'pro', questions, answers: [] });
    expect(out.typeCode).toBe('INFP');
    expect(out.tieBreakApplied.sort()).toEqual([...DIMS].sort());
  });
});

/* ══════════════════ 4. 명확도 경계값 (상품 무관 비율 기반) ══════════════════ */
describe('명확도 밴드 경계값 — 정확히 76/66/56/50% + 인접 경계', () => {
  // [aCount, bCount, percent, band]
  const cases: [number, number, number, string][] = [
    [19, 6, 76, 'very_clear'], // 19/25 = 76% → 경계 하한
    [15, 5, 75, 'clear'],      // 15/20 = 75% → very_clear 직전
    [33, 17, 66, 'clear'],     // 33/50 = 66% → 경계 하한
    [13, 7, 65, 'moderate'],   // 13/20 = 65% → clear 직전
    [14, 11, 56, 'moderate'],  // 14/25 = 56% → 경계 하한
    [11, 9, 55, 'slight'],     // 11/20 = 55% → moderate 직전
    [5, 5, 50, 'slight'],      // 5/5 = 50% → 동점 경계
  ];
  for (const [a, b, pct, band] of cases) {
    it(`${a}:${b} = ${pct}% → ${band}`, () => {
      const questions = makeDimQuestions('EI', a + b);
      const answers = answersForDim(questions, 'EI', a, b);
      const out = score({ product: 'pro', questions, answers });
      expect(out.clarity.EI.percent).toBe(pct);
      expect(out.clarity.EI.band).toBe(band);
    });
  }
  it('bandForPercent 순수함수 경계', () => {
    expect(bandForPercent(76)).toBe('very_clear');
    expect(bandForPercent(75)).toBe('clear');
    expect(bandForPercent(66)).toBe('clear');
    expect(bandForPercent(65)).toBe('moderate');
    expect(bandForPercent(56)).toBe('moderate');
    expect(bandForPercent(55)).toBe('slight');
    expect(bandForPercent(50)).toBe('slight');
  });
  it('CLARITY_BANDS 경계 상수 계약 일치', () => {
    expect(CLARITY_BANDS).toEqual([
      { band: 'very_clear', minPercent: 76 },
      { band: 'clear', minPercent: 66 },
      { band: 'moderate', minPercent: 56 },
      { band: 'slight', minPercent: 50 },
    ]);
  });
});

/* ══════════════════ 5. 상품별 스케일 (8/18/30) + basic 참고용 플래그 ══════════════════ */
describe('상품 스케일 환산 — 동일 비율이 basic 8 / standard 18 / pro 30로', () => {
  // 76% (19:6) 고정 비율 → 각 상품 score
  const ratio: [number, number] = [19, 6];
  const expected: Record<Product, number> = {
    basic: Math.round((26 / 50) * 8),   // 4.16 → 4
    standard: Math.round((26 / 50) * 18), // 9.36 → 9
    pro: Math.round((26 / 50) * 30),    // 15.6 → 16
  };
  for (const product of ['basic', 'standard', 'pro'] as Product[]) {
    it(`${product}: score=${expected[product]} (max ${TIER_SCALE[product].max}), band 동일 very_clear`, () => {
      const questions = makeDimQuestions('EI', ratio[0] + ratio[1]);
      const answers = answersForDim(questions, 'EI', ratio[0], ratio[1]);
      const out = score({ product, questions, answers });
      expect(out.clarity.EI.score).toBe(expected[product]);
      expect(out.clarity.EI.score).toBeLessThanOrEqual(TIER_SCALE[product].max);
      expect(out.clarity.EI.band).toBe('very_clear'); // band는 상품 무관
      expect(out.clarity.EI.percent).toBe(76);
    });
  }
  it('50%는 전 상품 score=0, 100%는 상한값', () => {
    expect(clarityScoreIndex(50, 'pro')).toBe(0);
    expect(clarityScoreIndex(100, 'pro')).toBe(30);
    expect(clarityScoreIndex(100, 'standard')).toBe(18);
    expect(clarityScoreIndex(100, 'basic')).toBe(8);
  });
  it('basic만 clarityAdvisory(참고용·단정 금지) 플래그', () => {
    expect(clarityAdvisory('basic')).toBe(true);
    expect(clarityAdvisory('standard')).toBe(false);
    expect(clarityAdvisory('pro')).toBe(false);
    expect(TIER_SCALE.basic.clarityAdvisory).toBe(true);
  });
});

/* ══════════════════ 6. 무응답 처리 ══════════════════ */
describe('무응답 — omittedCount 집계 + 부분 채점', () => {
  it('32문항 중 20응답 → omittedCount 12', () => {
    const questions = makeQuestions(8); // 4지표 × 8 = 32
    // EI만 8응답, 나머지는 부분/무응답
    const answers = [
      ...answersForDim(questions, 'EI', 5, 3),
      ...answersForDim(questions, 'SN', 4, 2),
      ...answersForDim(questions, 'TF', 3, 3),
    ];
    const out = score({ product: 'basic', questions, answers });
    expect(answers.length).toBe(20);
    expect(out.omittedCount).toBe(12);
    expect(out.clarity.EI.percent).toBe(63); // 5/8 = 62.5 → 63
  });
  it('세트 밖 응답은 무시(멱등·재개 안전)', () => {
    const questions = makeDimQuestions('EI', 8);
    const answers = [
      ...answersForDim(questions, 'EI', 5, 3),
      { questionId: 'GHOST-999', choice: 'A' as const },
    ];
    const out = score({ product: 'basic', questions, answers });
    expect(out.omittedCount).toBe(0);
    expect(out.scores.E + out.scores.I).toBe(8);
  });
});

/* ══════════════════ 7. 다면척도 (pro 전용) ══════════════════ */
describe('다면척도 facets — pro 전용, side/score(0..5)/zone', () => {
  it('basic/standard는 facets=null, clarityIndex=null', () => {
    const questions = makeQuestions(8);
    const answers = answersForType(questions, 'ENFP');
    expect(score({ product: 'basic', questions, answers }).facets).toBeNull();
    expect(score({ product: 'standard', questions, answers }).facets).toBeNull();
    expect(score({ product: 'basic', questions, answers }).clarityIndex).toBeNull();
    expect(score({ product: 'standard', questions, answers }).clarityIndex).toBeNull();
  });
  it('pro는 20 facet 전부 산출, score 0..5, side L|R', () => {
    const questions = makeQuestions(36);
    const answers = answersForType(questions, 'ENFP');
    const out = score({ product: 'pro', questions, answers });
    expect(out.facets).not.toBeNull();
    const facets = out.facets!;
    expect(Object.keys(facets).sort()).toEqual([...FACET_KEYS].sort());
    for (const key of FACET_KEYS) {
      const f = facets[key];
      expect(f.score).toBeGreaterThanOrEqual(0);
      expect(f.score).toBeLessThanOrEqual(5);
      expect(['L', 'R']).toContain(f.side);
      expect(['in_pref', 'midrange', 'out_pref']).toContain(f.zone);
    }
  });
  it('facet 극 집계: R측 100% 선택 → side R, score 5, zone 방향', () => {
    // SN 전 문항 B(=N, R측) 선택 → SN facet들 side R, score 5
    const questions = makeDimQuestions('SN', 10); // facet SN1..SN5 각 2문항
    const answers = answersForDim(questions, 'SN', 0, 10);
    const out = score({ product: 'pro', questions, answers });
    const f = out.facets!.SN1;
    expect(f.side).toBe('R');
    expect(f.score).toBe(5);
    // 지표 선호도 R(N) → side와 일치 → in_pref
    expect(f.zone).toBe('in_pref');
  });
  it('facet 동점(무응답)은 score 0 / midrange', () => {
    const questions = makeDimQuestions('SN', 10);
    const out = score({ product: 'pro', questions, answers: [] });
    expect(out.facets!.EI1.score).toBe(0);
    expect(out.facets!.EI1.zone).toBe('midrange');
  });
  it('clarityIndex: 전 100% → 100, 전 50% → 0', () => {
    const q = makeQuestions(8);
    expect(score({ product: 'pro', questions: q, answers: answersForType(q, 'ENFP') }).clarityIndex).toBe(100);
    const tie = DIMS.flatMap((d) => answersForDim(q, d, 4, 4));
    expect(score({ product: 'pro', questions: q, answers: tie }).clarityIndex).toBe(0);
  });
});

/* ══════════════════ 8. 승급 일관성 (기존 응답 재사용) ══════════════════ */
describe('이어하기 승급 — 재사용 응답은 상품과 무관하게 동일 판정(§4.5④)', () => {
  it('동일 questions+answers는 product만 달라도 scores·typeCode 동일', () => {
    const questions = makeQuestions(8);
    const answers = answersForType(questions, 'ESTJ');
    const b = score({ product: 'basic', questions, answers });
    const p = score({ product: 'pro', questions, answers });
    expect(b.typeCode).toBe(p.typeCode);
    expect(b.scores).toEqual(p.scores);
    expect(b.tieBreakApplied).toEqual(p.tieBreakApplied);
    // 상품 차이는 clarity 스케일·facets에만 국한
    expect(b.facets).toBeNull();
    expect(p.facets).not.toBeNull();
  });
  it('결정론: 동일 입력 → 완전 동일 출력', () => {
    const questions = makeQuestions(36);
    const answers = answersForType(questions, 'INTJ');
    const input: ScoringInput = { product: 'pro', questions, answers };
    expect(score(input)).toEqual(score(input));
  });
  it('실 샘플: basic 응답 + 잔여 pro 응답 → basic 응답 그대로 반영', () => {
    const basicQ = sampleQuestions('basic');
    const proQ = sampleQuestions('pro');
    // basic 문항에 A 응답
    const basicAns = basicQ.map((q) => ({ questionId: q.questionId, choice: 'A' as const }));
    // pro = basic 재사용 + 잔여(pro 전용) 문항 응답
    const basicIds = new Set(basicQ.map((q) => q.questionId));
    const extraAns = proQ
      .filter((q) => !basicIds.has(q.questionId))
      .map((q) => ({ questionId: q.questionId, choice: 'B' as const }));
    const proAns = [...basicAns, ...extraAns];

    const proOut = score({ product: 'pro', questions: proQ, answers: proAns });
    // basic 응답 각각이 pro 재채점에도 그대로 집계됐는지: basic-only pro 채점과 원점수 하한 비교
    const basicOnly = score({ product: 'pro', questions: basicQ, answers: basicAns });
    for (const letter of ['E', 'S', 'T', 'J'] as const) {
      // A(=L)만 답한 basic 응답 → L측 원점수는 pro가 basic-only 이상
      expect(proOut.scores[letter]).toBeGreaterThanOrEqual(basicOnly.scores[letter]);
    }
    expect(proAns.length).toBe(proQ.length); // 전 pro 문항 응답(재사용+잔여)
  });
});

/* ══════════════════ 9. 실 매핑 샘플 정합성 ══════════════════ */
describe('실 매핑 샘플(24문항) — 극 규약·shape 정합', () => {
  it('pro 샘플 채점 → 계약 shape 충족', () => {
    const questions = sampleQuestions('pro');
    const answers = questions.map((q) => ({ questionId: q.questionId, choice: 'A' as const }));
    const out = score({ product: 'pro', questions, answers });
    expect(out.typeCode).toBe('ESTJ'); // 전 A(=L: E,S,T,J)
    expect(out.facets).not.toBeNull();
    expect(Object.keys(out.facets!)).toHaveLength(20);
    expect(out.functionStack).toEqual(FUNCTION_STACK.ESTJ);
  });
  it('A=L 규약: 전 A 응답은 L극 문자(E/S/T/J) 유형', () => {
    const questions = sampleQuestions('basic');
    const answers = questions.map((q) => ({ questionId: q.questionId, choice: 'A' as const }));
    const out = score({ product: 'basic', questions, answers });
    expect(out.typeCode).toBe('ESTJ');
  });
});
