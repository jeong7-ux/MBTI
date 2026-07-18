import type { Result, ReportData, Dimension, FacetKey } from '@contract';

/**
 * Result → 표준양식 DATA{} 어댑터.
 * 표준양식 <script>의 DATA 구조와 무손실 1:1 매핑:
 *   DATA.tier    ← result.product        ('basic'|'standard'|'pro')
 *   DATA.clarity ← result.clarity[dim]   → { pole, score }  (score 상한은 상품 스케일 8/18/30)
 *   DATA.myType  ← result.typeCode
 *   DATA.facets  ← result.facets[key]    → { side, score(0..5) }  (pro만, 그 외 전부 null)
 *
 * renderClarity/renderFacets/buildSummaryGraph 로직이 이 shape을 그대로 소비한다.
 * clarity score를 상품 max로 나눠 막대 폭을 계산하므로 product 없이 렌더하면 스케일이 어긋난다.
 */

const DIMS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];
const FACET_KEYS: FacetKey[] = [
  'EI1', 'EI2', 'EI3', 'EI4', 'EI5',
  'SN1', 'SN2', 'SN3', 'SN4', 'SN5',
  'TF1', 'TF2', 'TF3', 'TF4', 'TF5',
  'JP1', 'JP2', 'JP3', 'JP4', 'JP5',
];

export function toReportData(result: Result): ReportData {
  const clarity = {} as ReportData['clarity'];
  for (const dim of DIMS) {
    const c = result.clarity[dim];
    clarity[dim] = c ? { pole: c.pole, score: c.score } : null;
  }

  const facets = {} as ReportData['facets'];
  for (const key of FACET_KEYS) {
    const f = result.facets ? result.facets[key] : null;
    facets[key] = f ? { side: f.side, score: f.score } : null;
  }

  return {
    tier: result.product,
    clarity,
    myType: result.typeCode,
    facets,
  };
}
