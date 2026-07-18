// HTTP 응답 헬퍼 — 계약 규약 준수.
//  · 성공: payload 그대로 반환(비래핑). 배열은 배열로.
//  · 에러: { error: ApiError } 래핑 (계약 lib/contract §3).
import { NextResponse } from 'next/server';
import type { ApiError } from '@contract';
import { ZodError, type ZodSchema } from 'zod';

/** 성공 응답 — 계약 payload 그대로(비래핑). */
export function ok<T>(payload: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(payload, init);
}

/** 에러 응답 — { error: ApiError } 래핑. */
export function fail(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
): NextResponse {
  const error: ApiError = { code, message, ...(details ? { details } : {}) };
  return NextResponse.json({ error }, { status });
}

// 표준 에러 코드 (계약 ApiError.code)
export const ERR = {
  SESSION_NOT_FOUND: (id?: string) => fail('SESSION_NOT_FOUND', '세션을 찾을 수 없습니다.', 404, { id }),
  RESULT_NOT_FOUND: () => fail('RESULT_NOT_FOUND', '결과를 찾을 수 없습니다.', 404),
  INVALID_PRODUCT: (d?: Record<string, unknown>) => fail('INVALID_PRODUCT', '유효하지 않은 상품입니다.', 400, d),
  INVALID_UPGRADE: (d?: Record<string, unknown>) => fail('INVALID_UPGRADE', '상위 상품으로만 승급할 수 있습니다.', 400, d),
  INCOMPLETE_RESPONSES: (d?: Record<string, unknown>) => fail('INCOMPLETE_RESPONSES', '모든 문항에 응답해야 채점할 수 있습니다.', 409, d),
  ALREADY_SCORED: () => fail('ALREADY_SCORED', '이미 채점된 세션입니다.', 409),
  VALIDATION: (d?: Record<string, unknown>) => fail('VALIDATION_ERROR', '요청 형식이 올바르지 않습니다.', 422, d),
  UNAUTHORIZED: () => fail('UNAUTHORIZED', '본인만 열람할 수 있습니다.', 403),
  AGE_RESTRICTED: () => fail('AGE_RESTRICTED', '만 14세 미만은 이용할 수 없습니다.', 403),
  NAMING_VIOLATION: (d?: Record<string, unknown>) => fail('NAMING_VIOLATION', '에셋 파일명 규칙 위반.', 422, d),
  INTERNAL: (msg = '서버 오류') => fail('INTERNAL_ERROR', msg, 500),
};

/** zod 파싱 → 실패 시 계약 에러 응답. 성공 시 데이터 반환. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T } | { res: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { res: ERR.VALIDATION({ reason: 'invalid_json' }) };
  }
  const r = schema.safeParse(json);
  if (!r.success) {
    return { res: ERR.VALIDATION({ issues: (r.error as ZodError).issues }) };
  }
  return { data: r.data };
}
