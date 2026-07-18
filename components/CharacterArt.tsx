'use client';
import { useState } from 'react';
import type { TypeCode, AvatarVersion } from '@contract';
import { CharacterPlaceholder } from '@/components/CharacterPlaceholder';
import { TYPE_NICKNAME } from '@/lib/report/typeMeta';

/**
 * 유형×성별 캐릭터 아트 (원본 SVG · public/characters/{TYPE}_{M|F}.svg · §6.4/§6.5).
 * 실 에셋이 없으면 CharacterPlaceholder로 우아하게 폴백.
 * alt 규칙(§6.4): "{유형코드} {별칭} 캐릭터 ({성별} 버전)".
 * 버전 전환은 gender 스왑만 — 재채점 불필요(F-17).
 */
export function CharacterArt({
  type,
  gender,
  size = 96,
  className,
}: {
  type: TypeCode;
  gender: AvatarVersion;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const genderLabel = gender === 'F' ? '여성' : '남성';
  const alt = `${type} ${TYPE_NICKNAME[type]} 캐릭터 (${genderLabel} 버전)`;

  if (failed) {
    return <CharacterPlaceholder type={type} gender={gender} size={size} showRole={false} />;
  }
  return (
    // 정적 SVG 서빙 — next/image 불필요. 실패 시 플레이스홀더 폴백.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/characters/${type}_${gender}.svg`}
      alt={alt}
      height={size}
      className={className}
      style={{ height: size, width: 'auto', objectFit: 'contain', display: 'block' }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
