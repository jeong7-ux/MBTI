// 부록 D 섹션 노출 계산 — 서버 권위(프론트 임의 해석 금지, ADR-2).
// 계약 상수 SECTION_MATRIX / TIER_SCALE / UPGRADE_BANNER만 참조(규칙 재정의 금지).
import { SECTION_MATRIX, TIER_SCALE, UPGRADE_BANNER } from '@contract';
import type { Product, SectionVisibility, SectionAvail } from '@contract';

/** GET /api/results 응답의 sections 필드를 서버에서 계산. */
export function computeSectionVisibility(product: Product): SectionVisibility {
  const sections: Record<string, SectionAvail> = {};
  for (const key of Object.keys(SECTION_MATRIX)) {
    sections[key] = SECTION_MATRIX[key][product];
  }
  return {
    product,
    scale: TIER_SCALE[product],
    sections,
    upgradeTargets: UPGRADE_BANNER[product],
  };
}
