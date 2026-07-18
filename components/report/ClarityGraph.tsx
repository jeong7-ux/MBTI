import type { Product } from '@contract';
import { TIER_SCALE } from '@contract';
import type { ReportData } from '@contract';
import { DIMENSIONS, DIMENSION_POLES, CLARITY_BAND_KO } from '@/lib/report/typeMeta';
import { barStyle } from './barStyle';

/**
 * 선호 분명도 양방향 막대 — 표준양식 renderClarity()/renderClarityScale() 포팅.
 * pct = min(score,max)/max*50, pole L→right:50%, R→left:50%. max=상품 스케일(8/18/30).
 */
export function ClarityGraph({
  clarity, product, advisory, index,
}: {
  clarity: ReportData['clarity'];
  product: Product;
  advisory: boolean;
  index: { pole: string; score: number; band: string }[] | null;
}) {
  const { max, step } = TIER_SCALE[product];

  // renderClarityScale 포팅: max→0→max
  const nums: number[] = [];
  for (let v = max; v > 0; v -= step) nums.push(v);
  nums.push(0);
  for (let v = step; v <= max; v += step) nums.push(v);

  return (
    <>
      <div className="clarity" role="img" aria-label="선호 분명도 그래프">
        <div className="head">
          <div />
          <div className="zone-lbls">
            {['매우분명', '분명', '보통', '약간', '약간', '보통', '분명', '매우분명'].map((z, i) => (
              <span key={i}>{z}</span>
            ))}
          </div>
          <div />
        </div>

        {DIMENSIONS.map((dim) => {
          const c = clarity[dim];
          const poles = DIMENSION_POLES[dim];
          const pct = c ? (Math.min(c.score, max) / max) * 50 : 0;
          return (
            <div className="row" key={dim}>
              <div className="pole-lbl">{poles.L.ko} ({poles.L.code})</div>
              <div className="track" data-scale={dim}>
                {c ? (
                  <div className="bar-fill grow" style={barStyle(c.pole, pct)} />
                ) : (
                  <div className="bar-hint">← 미기입 →</div>
                )}
              </div>
              <div className="pole-lbl">{poles.R.ko} ({poles.R.code})</div>
            </div>
          );
        })}

        <div className="scale">
          <div />
          <div className="nums">{nums.map((n, i) => <span key={i}>{n}</span>)}</div>
          <div />
        </div>
      </div>

      {/* 선호지표 · 분명도 지수 표 (표준양식 idx-table) + SR 텍스트 대체 */}
      <table className="idx-table">
        <tbody>
          <tr>
            <th style={{ width: '25%' }}>선호지표</th>
            {DIMENSIONS.map((dim) => {
              const c = clarity[dim];
              const poles = DIMENSION_POLES[dim];
              return (
                <td key={dim}>
                  <div className="slot center">{c ? `${poles[c.pole].ko}(${poles[c.pole].code})` : '—'}</div>
                </td>
              );
            })}
          </tr>
          <tr>
            <th>선호 분명도 지수</th>
            {DIMENSIONS.map((dim, i) => {
              const c = clarity[dim];
              const band = index?.[i]?.band;
              return (
                <td key={dim}>
                  <div className="slot center">
                    {c ? `${c.score}${band ? ` · ${CLARITY_BAND_KO[band] ?? ''}` : ''}` : '—'}
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {advisory && (
        <div className="note">
          <b>참고용 지수</b> — 간편 검사(지표당 8문항)의 분명도 지수는 참고용입니다. 경계선(약간) 구간은 일반·전문 검사로 재검사를 권장합니다.
        </div>
      )}
      <div className="note">
        ※ 선호 분명도 지수는 양극 중 어느 쪽 선호가 더 분명한지를 알려주는 지수입니다. 선호의 유능·성숙·발달을 의미하지 않습니다.
      </div>
    </>
  );
}
