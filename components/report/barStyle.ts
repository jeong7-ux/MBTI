import type { CSSProperties } from 'react';
import type { Pole } from '@contract';

/**
 * 양방향 막대 위치 계산 — 표준양식 렌더 규약 공통.
 * pole/side 'L' → 중앙 기준 왼쪽(right:50%), 'R' → 오른쪽(left:50%). width = pct(%).
 * --grow-origin: grow 애니메이션 기준점(중앙 = 막대의 50% 붙은 변).
 */
export function barStyle(side: Pole, pct: number): CSSProperties {
  const base: Record<string, string> =
    side === 'L'
      ? { right: '50%', width: `${pct}%`, '--grow-origin': 'right' }
      : { left: '50%', width: `${pct}%`, '--grow-origin': 'left' };
  return base as CSSProperties;
}
