import type { Product } from '@contract';

const COLS: Product[] = ['basic', 'standard', 'pro'];
const HEAD: Record<Product, string> = { basic: '간편 검사', standard: '일반 검사', pro: '전문 검사' };

/** 표준양식 tinfo 비교표 — 현재 상품 열 하이라이트(setTier의 비교표 로직 포팅). */
const ROWS: { label: string; cells: Record<Product, React.ReactNode>; ok?: Record<Product, boolean> }[] = [
  { label: '문항 수', cells: { basic: '32문항 (지표당 8)', standard: '72문항 (지표당 18)', pro: '144문항 (지표당 36)' } },
  { label: '소요 시간', cells: { basic: '약 5분', standard: '약 10분', pro: '15~20분' } },
  { label: '유형 판정 (4지표)', cells: { basic: '●', standard: '●', pro: '●' }, ok: { basic: true, standard: true, pro: true } },
  { label: '선호 분명도 그래프', cells: { basic: '참고용 (0~8)', standard: '● (0~18)', pro: '● (0~30)' }, ok: { basic: false, standard: true, pro: true } },
  { label: '유형 프로파일 해설', cells: { basic: '요약 (별칭·키워드)', standard: '●', pro: '●' }, ok: { basic: false, standard: true, pro: true } },
  { label: '심리기능 위계 (Ⅳ)', cells: { basic: '—', standard: '기능 위계만', pro: '● + 상호작용·스트레스' }, ok: { basic: false, standard: false, pro: true } },
  { label: '심층 다면척도 20종 (Ⅴ)', cells: { basic: '—', standard: '—', pro: '●' }, ok: { basic: false, standard: false, pro: true } },
  { label: '일관성 지수·전문가 소견', cells: { basic: '—', standard: '—', pro: '●' }, ok: { basic: false, standard: false, pro: true } },
  { label: '권장 용도', cells: { basic: '빠른 자기확인·공유', standard: '자기이해·관계 참고', pro: '전문 해석·상담 연계' } },
];

export function PlanTable({ current }: { current?: Product }) {
  return (
    <table className="tinfo">
      <tbody>
        <tr>
          <th style={{ width: '24%' }}>구분</th>
          {COLS.map((c) => (
            <th key={c} className={current === c ? 'cur-head' : ''}>{HEAD[c]}</th>
          ))}
        </tr>
        {ROWS.map((r) => (
          <tr key={r.label}>
            <td>{r.label}</td>
            {COLS.map((c) => {
              const isNo = r.cells[c] === '—';
              const cls = [current === c ? 'cur' : '', r.ok?.[c] ? 'ok' : '', isNo ? 'no-i' : ''].filter(Boolean).join(' ');
              return <td key={c} className={cls}>{r.cells[c]}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
