/**
 * 목 모드 전역 배지 — USE_MOCK 활성 시 전 화면 우하단에 고정 노출.
 * 배포 환경에서 예시 데이터가 실 검사로 오인되는 사고 방지(재발 방지 조치).
 * 실 API 모드(기본)에서는 아무것도 렌더하지 않는다.
 */
import { USE_MOCK } from '@/lib/api';

export default function MockBadge() {
  if (!USE_MOCK) return null;
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 9999,
        padding: '6px 12px',
        borderRadius: 999,
        background: '#B01F28',
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.02em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }}
    >
      목 모드 — 예시 데이터 (실 검사 아님)
    </div>
  );
}
