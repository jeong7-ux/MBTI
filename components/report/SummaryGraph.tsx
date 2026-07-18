import { Fragment } from 'react';
import type { ReportData, FacetKey } from '@contract';
import { FACET_DEFS } from '@/lib/report/typeMeta';
import { barStyle } from './barStyle';

/** 결과요약 다면척도 종합 그래프 — 표준양식 buildSummaryGraph() 포팅(20행). */
export function SummaryGraph({ facets }: { facets: ReportData['facets'] }) {
  return (
    <div className="facet-sec">
      <div className="fhead">
        <b>종합 그래프</b>
        <span className="vs">굵은 막대 = 개인 점수</span>
      </div>
      <div id="sumGraph">
        {FACET_DEFS.map((g) => (
          <Fragment key={g.dim}>
            <div className="frow">
              <div className="fl"><b style={{ color: 'var(--pine)' }}>{g.left}</b></div>
              <div style={{ textAlign: 'center', fontSize: '.62rem', color: 'var(--sub)', fontWeight: 700, padding: '6px 0' }}>
                {g.dim} 다면척도
              </div>
              <div className="fr"><b style={{ color: '#8A5B00' }}>{g.right}</b></div>
            </div>
            {g.rows.map((r) => {
              const f = facets[r.key as FacetKey];
              const pct = f ? (Math.min(f.score, 5) / 5) * 50 : 0;
              return (
                <div className="frow" key={r.key}>
                  <div className="fl"><b>{r.l}</b></div>
                  <div className="ftrack" data-sum={r.key}>
                    {f ? (
                      <div className="bar-fill grow" style={barStyle(f.side, pct)} />
                    ) : (
                      <div className="bar-hint" />
                    )}
                  </div>
                  <div className="fr"><b>{r.r}</b></div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
      <div className="fscale">
        <div />
        <div className="nums">{[5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5].map((n, i) => <span key={i}>{n}</span>)}</div>
        <div />
      </div>
    </div>
  );
}
