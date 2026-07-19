// 관리자 패널 인증 — 하드코딩 계정(단일 운영자) 전용, Node 내장 crypto만 사용(신규 의존성 없음).
//  · 비밀번호 평문은 소스에 두지 않는다 — scrypt 해시 상수시간 비교로만 검증.
//  · 세션은 HMAC 서명 토큰(httpOnly 쿠키)으로 유지(무상태·DB 미사용).
//  · 이 패널은 검사 데이터 초기화 같은 파괴적 운영 작업의 게이트다(§10 접근 통제).
import * as crypto from 'node:crypto';
import { cookies } from 'next/headers';

// ── 계정 상수(리더 확정 값 — 절대 변경 금지) ─────────────────────────
export const ADMIN_USER = 'wikiman';
export const ADMIN_PW_SALT = 'mindtype.admin.v1';
// = crypto.scryptSync('admin!@098', ADMIN_PW_SALT, 32).toString('hex')
export const ADMIN_PW_HASH = '91d3f39cd4d692d0eba6b168fed4ec1c2a7b520951f51d691e952e4653f0133d';

export const COOKIE_NAME = 'mt_admin';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2시간

/**
 * 세션 서명 키(HMAC).
 *  · env ADMIN_SESSION_SECRET 있으면 사용, 없으면 하드코딩 사양이므로 PW 해시를 키 파생 원천으로 허용.
 *  · sha256으로 항상 32바이트 고정 키를 만든다(env 값 길이 무관).
 */
function sessionKey(): Buffer {
  const secret = process.env.ADMIN_SESSION_SECRET ?? ADMIN_PW_HASH;
  return crypto.createHash('sha256').update(secret).digest();
}

/** 길이 무관 상수시간 문자열 비교 — 양쪽을 sha256(32B)로 고정 길이화 후 timingSafeEqual. */
function safeEqualStr(a: string, b: string): boolean {
  const da = crypto.createHash('sha256').update(a).digest();
  const db = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(da, db);
}

/**
 * 자격 증명 검증.
 *  · username: 상수시간 비교. password: scrypt(같은 salt·keylen) 후 해시 상수시간 비교.
 *  · 두 검증을 모두 수행한 뒤 AND — 어느 필드가 틀렸는지 분기/타이밍으로 노출하지 않는다.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const userOk = safeEqualStr(username, ADMIN_USER);

  const derived = crypto.scryptSync(password, ADMIN_PW_SALT, 32); // 32B
  const expected = Buffer.from(ADMIN_PW_HASH, 'hex'); // 32B
  const pwOk = derived.length === expected.length && crypto.timingSafeEqual(derived, expected);

  return userOk && pwOk;
}

// ── 세션 토큰(payload.b64url + '.' + hmac.b64url) ─────────────────────
type SessionPayload = { u: string; exp: number };

/** 서명 세션 토큰 발급 — payload = { u:'wikiman', exp:<now+2h> }. */
export function signSession(): string {
  const payload: SessionPayload = { u: ADMIN_USER, exp: Date.now() + SESSION_TTL_MS };
  const payloadJson = JSON.stringify(payload);
  const p = Buffer.from(payloadJson, 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', sessionKey()).update(payloadJson).digest();
  return `${p}.${sig.toString('base64url')}`;
}

/** 세션 토큰 검증 — 서명 timingSafeEqual 재검증 + exp > now. 형식오류/만료/변조는 false. */
export function verifySession(token: string): boolean {
  if (typeof token !== 'string' || token.length === 0) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [p, s] = parts;

  const payloadJson = Buffer.from(p, 'base64url').toString('utf8');
  const expectedSig = crypto.createHmac('sha256', sessionKey()).update(payloadJson).digest();
  const givenSig = Buffer.from(s, 'base64url');
  // 서명 상수시간 재검증(길이 다르면 timingSafeEqual이 throw → 먼저 길이 확인).
  if (givenSig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(givenSig, expectedSig)) return false;

  // 서명 유효 → payload 파싱·주체·만료 확인.
  let payload: SessionPayload;
  try {
    payload = JSON.parse(payloadJson) as SessionPayload;
  } catch {
    return false;
  }
  if (!payload || payload.u !== ADMIN_USER) return false;
  if (typeof payload.exp !== 'number' || !(payload.exp > Date.now())) return false;
  return true;
}

/** 현재 요청의 mt_admin 쿠키를 읽어 인증 여부 판정(라우트 게이트용). */
export function isAuthed(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySession(token);
}

/** 쿠키 옵션 — httpOnly·SameSite=Lax·2h. 운영에서만 secure. */
export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7200,
    secure: process.env.NODE_ENV === 'production',
  };
}
