import { Fragment } from 'react';
import type { FunctionStack as Stack } from '@contract';
import { FUNCTION_LABEL } from '@/lib/report/typeMeta';

/** 심리기능 위계 모식도 — 표준양식 fnstack(주→부→3차→열등). */
export function FunctionStack({ stack }: { stack: Stack }) {
  const items: { cls: string; code: keyof typeof FUNCTION_LABEL; tag: string }[] = [
    { cls: 'f1', code: stack.dominant, tag: '주기능' },
    { cls: 'f2', code: stack.auxiliary, tag: '부기능' },
    { cls: 'f3', code: stack.tertiary, tag: '3차기능' },
    { cls: 'f4', code: stack.inferior, tag: '열등기능' },
  ];
  return (
    <div className="fnstack">
      {items.map((it, i) => (
        <Fragment key={it.tag}>
          <div className={`fn ${it.cls}`}>
            <div className="circ">
              {FUNCTION_LABEL[it.code].ko}
              <small>{it.code}</small>
            </div>
            <span className="tag">{it.tag}</span>
          </div>
          {i < items.length - 1 && <span className="fn-arrow" aria-hidden="true">▶</span>}
        </Fragment>
      ))}
    </div>
  );
}
