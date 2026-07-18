/**
 * 채점 엔진 어댑터 — ✅ 엔진 연결 완료 (scoring-engineer 소유 `packages/scoring`).
 *
 * 백엔드는 채점 수식을 재구현하지 않는다(경계 준수). 실제 순수함수 `score`(계약
 * `ScoreFn`)를 그대로 재노출한다. shape/범위는 계약(`ScoringInput`/`ScoringOutput`)에
 * 고정되어 있어 submit→Result 영속화 라우트는 변경 없이 실엔진으로 동작한다.
 *
 * (2026-07-18 리더 통합: 목 어댑터 → `@scoring` 실엔진으로 배선. 골든 65/65 통과본.)
 */
import { score } from '@scoring';

export { score };

/** 목 채점 여부(응답 헤더/로그 표기용). 실엔진 연결 완료 → false. */
export const SCORING_IS_MOCK = false;
