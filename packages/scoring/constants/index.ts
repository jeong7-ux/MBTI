/**
 * 채점 상수 미러 (ADR-5) — 계약(lib/contract)을 단일 소스로 re-export.
 * 채점 엔진·qa·검증 스크립트가 이 배럴만 참조하면 계약과 자동 동기(불일치 방지).
 */
import type { Dimension, DimensionScores, FacetKey, Pole } from '../../../lib/contract';
import {
  CLARITY_BANDS,
  FUNCTION_STACK,
  PRODUCT_ITEM_COUNT,
  PRODUCT_ORDER,
  TIE_BREAK_POLE,
  TIER_SCALE,
} from '../../../lib/contract';

export {
  CLARITY_BANDS,
  FUNCTION_STACK,
  PRODUCT_ITEM_COUNT,
  PRODUCT_ORDER,
  TIE_BREAK_POLE,
  TIER_SCALE,
};
export * from './functionStack';

/** 지표 순서(유형코드 조립·순회 기준). */
export const DIMENSIONS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];

/**
 * 지표 극(Pole) → 결과 문자.
 * 규약: L = 첫글자(E/S/T/J) · R = 둘째글자(I/N/F/P). 표준양식 렌더 L=좌/R=우와 일치.
 */
export const POLE_LETTER: Record<Dimension, Record<Pole, keyof DimensionScores>> = {
  EI: { L: 'E', R: 'I' },
  SN: { L: 'S', R: 'N' },
  TF: { L: 'T', R: 'F' },
  JP: { L: 'J', R: 'P' },
};

/** 다면척도 20종 키(지표별 5종). facets Record 완전성 보장에 사용. */
export const FACET_KEYS: FacetKey[] = [
  'EI1', 'EI2', 'EI3', 'EI4', 'EI5',
  'SN1', 'SN2', 'SN3', 'SN4', 'SN5',
  'TF1', 'TF2', 'TF3', 'TF4', 'TF5',
  'JP1', 'JP2', 'JP3', 'JP4', 'JP5',
];

/** facetKey → 소속 지표(앞 2글자). */
export function facetDimension(key: FacetKey): Dimension {
  return key.slice(0, 2) as Dimension;
}
