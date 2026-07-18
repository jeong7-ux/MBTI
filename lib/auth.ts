/**
 * 인증·접근제어·개인정보 게이트 — ⚠️ 스텁(실 OAuth/암호화 지점 주석 표기).
 * §10 보안: 결과 상세는 본인만(F-15), 접근 로그, 만 14세 미만 제한.
 */
import { prisma } from '@/lib/db';
import type { AvatarVersion } from '@contract';

/** 요청에서 인증 주체 식별.
 *  TODO(인증): 실제로는 Authorization: Bearer <accessToken> 검증(JWT/세션).
 *  현재는 스텁 — 헤더 'x-user-id'가 있으면 그 사용자로 취급(개발/QA용).
 */
export function getActor(req: Request): { userId: string | null } {
  const uid = req.headers.get('x-user-id');
  return { userId: uid && uid.length > 0 ? uid : null };
}

export function clientIp(req: Request): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null
  );
}

/** §10 접근 로그(민감정보 접근 기록). best-effort, 실패해도 요청 흐름 비차단. */
export async function logAccess(args: {
  action: string; targetType: string; targetId: string; actorId?: string | null; ip?: string | null;
}): Promise<void> {
  try {
    await prisma.accessLog.create({
      data: {
        action: args.action,
        targetType: args.targetType,
        targetId: args.targetId,
        actorId: args.actorId ?? null,
        ip: args.ip ?? null,
      },
    });
  } catch {
    // 로그 실패는 서비스 흐름을 막지 않는다.
  }
}

/**
 * 결과 상세 열람 권한(F-15 공개 범위).
 * 규칙: (1) 세션에 소유자(userId)가 없으면(비로그인 검사) 토큰 소지자에게 허용
 *       (2) 소유자가 있으면 본인(actor.userId === session.userId)만 상세 허용.
 * 토큰 자체가 추측 불가이므로 1차 방어이며, 2차로 소유자 매칭을 강제.
 */
export function canViewResultDetail(sessionUserId: string | null, actorUserId: string | null): boolean {
  if (!sessionUserId) return true; // 비로그인 검사 → 토큰 소지자 열람
  return sessionUserId === actorUserId;
}

/** 만 14세 미만 수집 제한 게이트(§10). birthYear 미제공 시 통과(강제수집 금지). */
export function isAgeAllowed(birthYear: number | null | undefined, now = new Date()): boolean {
  if (birthYear == null) return true; // 강제 수집 금지 — 미제공은 차단하지 않음
  return now.getFullYear() - birthYear >= 14;
}

export type { AvatarVersion };
