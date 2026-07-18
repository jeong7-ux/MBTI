/** 진행률 바 — 상단 sticky, "현재 파트 · n/총" mono 병기(정직한 진행 표시). */
export function Progress({ part, answered, total }: { part: number; answered: number; total: number }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-meta">
        <span>파트 {part}</span>
        <span className="cnt">{answered} / {total}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={answered}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`검사 진행률 ${pct}%`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
