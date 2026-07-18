import type { TypeCode } from '@contract';
import { GRID16_ORDER, TYPE_NICKNAME } from '@/lib/report/typeMeta';

/** 16유형 도표 — 표준양식 initGrid16 포팅(내 유형 고정 하이라이트, 색+텍스트 병기). */
export function Grid16({ myType }: { myType: TypeCode | null }) {
  return (
    <>
      <div className="grid16" role="list" aria-label="16가지 성격유형 도표">
        {GRID16_ORDER.map((t) => {
          const me = t === myType;
          return (
            <div
              key={t}
              className={`t16${me ? ' me' : ''}`}
              role="listitem"
              aria-current={me ? 'true' : undefined}
            >
              <b>{t}</b>
              <span>{TYPE_NICKNAME[t]}</span>
              {me && <span className="sr-only">— 나의 유형</span>}
            </div>
          );
        })}
      </div>
      <span className="legend-me"><i />나의 유형</span>
    </>
  );
}
