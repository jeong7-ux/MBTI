// 추측 불가·열거 불가 토큰 발급 (§10 보안).
// nanoid 21자(기본) ≈ 126bit, 24자 ≈ 143bit. 재개/결과 토큰은 128bit+ 요구.
import { customAlphabet } from 'nanoid';

// URL-safe, 혼동 문자 제외 알파벳. 24자 → 약 143bit 엔트로피.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
const gen = customAlphabet(ALPHABET, 24);

/** 이어하기 재개 토큰 (추측 불가·URL 노출). */
export function newResumeToken(): string {
  return `rs_${gen()}`;
}

/** 결과 조회 토큰 (추측 불가·열거 불가·§10, F-15). */
export function newResultToken(): string {
  return `rt_${gen()}`;
}
