import type { TypeCode, AvatarVersion } from '@contract';
import { TYPE_NICKNAME, temperamentOf, TEMPERAMENT_LABEL, TEMPERAMENT_VAR, TEMPERAMENT_TINT_VAR } from '@/lib/report/typeMeta';

/**
 * 캐릭터 플레이스홀더 — 실에셋 34종 부재 구간(§6.4).
 * 정확한 alt 규칙("{유형코드} {별칭} 캐릭터 ({성별} 버전)")·파일명 규칙({TYPE}_{M|F})을 유지.
 * 색만으로 구분 금지 → 유형 코드 텍스트 병기(WCAG, §5.2). 기질색은 면/하단바에만(텍스트 금지).
 */
export function CharacterPlaceholder({
  type, gender, size = 120, showRole = true,
}: {
  type: TypeCode;
  gender: AvatarVersion;
  size?: number;
  showRole?: boolean;
}) {
  const temp = temperamentOf(type);
  const genderKo = gender === 'M' ? '남성' : '여성';
  const alt = `${type} ${TYPE_NICKNAME[type]} 캐릭터 (${genderKo} 버전)`;
  return (
    <div
      className="char"
      style={{ width: size, background: `var(${TEMPERAMENT_TINT_VAR[temp]})` }}
      role="img"
      aria-label={alt}
      data-filename={`${type}_${gender}`}
    >
      <div style={{ textAlign: 'center' }}>
        <div className="code">{type}</div>
        {showRole && <div className="role">{TEMPERAMENT_LABEL[temp]} · {genderKo}</div>}
      </div>
      <div className="tbar" style={{ background: `var(${TEMPERAMENT_VAR[temp]})` }} aria-hidden="true" />
    </div>
  );
}
