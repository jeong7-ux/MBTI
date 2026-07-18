import type { ReportData, FacetKey } from '@contract';
import { FACET_DEFS, DIMENSION_POLES } from '@/lib/report/typeMeta';
import type { ReportContent } from './reportContent';
import { barStyle } from './barStyle';

const ZONE_KO: Record<string, string> = { in_pref: '선호 내', midrange: '중간범위', out_pref: '선호 외' };

/** 다면척도 4개 지표 섹션 — 표준양식 renderFacets() 포팅(0~5 → /5*50%). pro 전용. */
export function FacetSection({ facets, content }: { facets: ReportData['facets']; content: ReportContent }) {
  return (
    <>
      {FACET_DEFS.map((g) => {
        const poles = DIMENSION_POLES[g.dim];
        return (
          <div key={g.dim}>
            <div className="facet-sec">
              <div className="fhead">
                <b>{sectionTitle(g.dim)} <i>{poles.L.code} ↔ {poles.R.code}</i></b>
                <span className="vs">{g.left} 선호 내 ← · → {g.right} 선호 외</span>
              </div>
              {g.rows.map((r, ri) => {
                const f = facets[r.key as FacetKey];
                const pct = f ? (Math.min(f.score, 5) / 5) * 50 : 0;
                return (
                  <div className="frow" key={r.key}>
                    <div className="fl"><b>{r.l}</b><small>{r.ld}</small></div>
                    <div className="ftrack" data-facet={r.key}>
                      {ri === 0 && (
                        <>
                          <span className="zone z1">선호 내</span>
                          <span className="zone z2">중간범위</span>
                          <span className="zone z3">선호 외</span>
                        </>
                      )}
                      {f ? (
                        <div className="bar-fill grow" style={barStyle(f.side, pct)} />
                      ) : (
                        <div className="bar-hint" />
                      )}
                    </div>
                    <div className="fr"><b>{r.r}</b><small>{r.rd}</small></div>
                  </div>
                );
              })}
              <div className="fscale">
                <div />
                <div className="nums">{[5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5].map((n, i) => <span key={i}>{n}</span>)}</div>
                <div />
              </div>
            </div>

            <div className="facet-expl">
              {g.rows.map((r) => {
                const expl = content.facetExpl(r.key as FacetKey);
                const f = facets[r.key as FacetKey];
                return (
                  <div className="fx" key={r.key}>
                    <b>{r.l} {f && <em>({ZONE_KO[f.side === 'L' ? 'in_pref' : 'out_pref']})</em>}</b>
                    <div className={`slot${expl ? '' : ' empty'}`}>{expl ?? '해설 준비 중'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function sectionTitle(dim: string): string {
  switch (dim) {
    case 'EI': return '에너지 방향';
    case 'SN': return '인식기능';
    case 'TF': return '판단기능';
    default: return '생활양식';
  }
}
