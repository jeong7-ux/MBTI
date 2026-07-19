/**
 * API 페처 추상화 — 계약(@contract) 타입으로 backend 응답을 소비한다.
 *
 * 규약(01_architect_boundaries §데이터 흐름):
 *  - 성공 응답은 payload를 그대로(비래핑) 반환, 에러만 { error: ApiError }.
 *  - fetchJson<T>의 T를 backend 실 응답 shape과 일치시킨다(제네릭 캐스팅 우회 금지).
 *
 * 기본은 실 API. 목 모드는 개발 데모용 opt-in(NEXT_PUBLIC_USE_MOCK='true')이며,
 * 활성 시 전역 배지(MockBadge)로 노출된다 — 배포 환경에서 조용히 예시 데이터가 나가는 사고 방지.
 */
import type {
  ApiError,
  CreateSessionRequest, CreateSessionResponse,
  ResumeStateResponse,
  SaveResponsesRequest, SaveResponsesResponse,
  UpgradeSessionRequest, UpgradeSessionResponse,
  SubmitResponse,
  ResultViewResponse,
  QuestionsResponse,
  AssetsResponse,
  Product, AvatarVersion, TypeCode,
} from '@contract';
import * as mock from './mock';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
// 기본은 실 API(미설정 = 실 연결). 목 모드는 정확히 'true'일 때만 — 개발 데모용 opt-in.
// 과거 기본목(!=='false') 정책은 Netlify에 env 누락 시 배포 사이트가 조용히 예시 문항을
// 반복 노출하는 사고를 냈다(재발 방지: 기본 반전 + 활성 시 전역 배지).
// backend 라우트는 동일 오리진(/api/**)이므로 API_BASE 빈 값이어도 상대경로로 호출된다.
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

/**
 * fetch용 base URL 해석.
 *  - 클라이언트(브라우저): '' → 상대경로(동일 오리진). 서버 fetch와 달리 상대경로 정상.
 *  - 서버(RSC/SSR/route): 절대 URL 필수(상대경로면 ERR_INVALID_URL). 다음 순서로 해석:
 *      ① NEXT_PUBLIC_API_BASE(교차 오리진 명시) → ② NEXT_PUBLIC_SITE_URL/SITE_URL(env)
 *      → ③ next/headers 요청 host+proto(동일 오리진 자기호출; 비표준 포트도 정확)
 *      → ④ http://localhost:${PORT} (최후 폴백)
 * next/headers는 서버 분기에서 dynamic import(클라이언트 번들 평가 안 됨).
 */
async function resolveBaseUrl(): Promise<string> {
  if (API_BASE) return API_BASE.replace(/\/$/, '');
  if (typeof window !== 'undefined') return ''; // 브라우저: 상대경로
  const envSite = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  if (envSite) return envSite.replace(/\/$/, '');
  try {
    const { headers } = await import('next/headers');
    const h = headers();
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (host) {
      const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  } catch {
    /* headers() 컨텍스트 밖(예: 빌드 타임) — 폴백으로 진행 */
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export class ApiRequestError extends Error {
  constructor(public readonly apiError: ApiError, public readonly status: number) {
    super(apiError.message);
    this.name = 'ApiRequestError';
  }
}

function isErrorEnvelope(v: unknown): v is { error: ApiError } {
  return typeof v === 'object' && v !== null && 'error' in v &&
    typeof (v as { error: unknown }).error === 'object';
}

/** 실 API 호출. 성공=payload 그대로, 에러=ApiRequestError throw. 서버에서는 절대 base 자동 해석. */
export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await resolveBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok || isErrorEnvelope(body)) {
    const err: ApiError = isErrorEnvelope(body)
      ? body.error
      : { code: 'HTTP_' + res.status, message: `요청 실패 (${res.status})` };
    throw new ApiRequestError(err, res.status);
  }
  return body as T;
}

/* ── 엔드포인트 래퍼 (계약 shape 고정) ── */

export function createSession(req: CreateSessionRequest): Promise<CreateSessionResponse> {
  if (USE_MOCK) return mock.createSession(req);
  return fetchJson<CreateSessionResponse>('/api/sessions', { method: 'POST', body: JSON.stringify(req) });
}

export function getResumeState(token: string): Promise<ResumeStateResponse> {
  if (USE_MOCK) return mock.getResumeState(token);
  return fetchJson<ResumeStateResponse>(`/api/sessions/${encodeURIComponent(token)}`);
}

export function getQuestions(product: Product, version?: number): Promise<QuestionsResponse> {
  if (USE_MOCK) return mock.getQuestions(product, version);
  const q = new URLSearchParams({ product });
  if (version != null) q.set('version', String(version));
  return fetchJson<QuestionsResponse>(`/api/questions?${q.toString()}`);
}

export function saveResponses(sessionId: string, req: SaveResponsesRequest): Promise<SaveResponsesResponse> {
  if (USE_MOCK) return mock.saveResponses(sessionId, req);
  return fetchJson<SaveResponsesResponse>(`/api/sessions/${encodeURIComponent(sessionId)}/responses`, {
    method: 'PUT', body: JSON.stringify(req),
  });
}

export function upgradeSession(sessionId: string, req: UpgradeSessionRequest): Promise<UpgradeSessionResponse> {
  if (USE_MOCK) return mock.upgradeSession(sessionId, req);
  return fetchJson<UpgradeSessionResponse>(`/api/sessions/${encodeURIComponent(sessionId)}/upgrade`, {
    method: 'POST', body: JSON.stringify(req),
  });
}

export function submitSession(sessionId: string): Promise<SubmitResponse> {
  if (USE_MOCK) return mock.submitSession(sessionId);
  return fetchJson<SubmitResponse>(`/api/sessions/${encodeURIComponent(sessionId)}/submit`, { method: 'POST' });
}

export function getResult(resultToken: string): Promise<ResultViewResponse> {
  if (USE_MOCK) return mock.getResult(resultToken);
  return fetchJson<ResultViewResponse>(`/api/results/${encodeURIComponent(resultToken)}`);
}

export function getAssets(type?: TypeCode | 'VERSION', gender?: AvatarVersion): Promise<AssetsResponse> {
  if (USE_MOCK) return mock.getAssets(type, gender);
  const q = new URLSearchParams();
  if (type) q.set('type', type);
  if (gender) q.set('gender', gender);
  return fetchJson<AssetsResponse>(`/api/assets?${q.toString()}`);
}
