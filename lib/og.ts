// 결과 공유 OG 이미지 — 선택 버전 캐릭터 SVG 템플릿(F-15).
// SVG → PNG 변환은 렌더 인프라(@resvg/resvg-js 또는 satori) 결정 후 연결.
// 현재는 SVG를 직접 서빙(image/svg+xml). 추가 의존성 없이 동작.
import type { TypeCode, AvatarVersion } from '@contract';

// 기질 컬러 그룹(§6.2) — 4그룹.
const TEMPERAMENT_COLOR: Record<'NT' | 'NF' | 'SJ' | 'SP', string> = {
  NT: '#6C5CE7', NF: '#00B894', SJ: '#0984E3', SP: '#E17055',
};

function temperamentOf(type: TypeCode): 'NT' | 'NF' | 'SJ' | 'SP' {
  const t = type;
  if (t.includes('N') && (t.includes('T'))) return 'NT';
  if (t.includes('N') && (t.includes('F'))) return 'NF';
  if (t.includes('S') && (t.includes('J'))) return 'SJ';
  return 'SP';
}

/** OG용 SVG 문자열 생성. characterUrl(에셋)이 있으면 <image>로 합성. */
export function buildOgSvg(args: {
  typeCode: TypeCode;
  nickname?: string;
  gender: AvatarVersion;
  characterUrl?: string | null;
}): string {
  const { typeCode, nickname, gender, characterUrl } = args;
  const color = TEMPERAMENT_COLOR[temperamentOf(typeCode)];
  const label = nickname ? escapeXml(nickname) : typeCode;
  const img = characterUrl
    ? `<image href="${escapeXml(characterUrl)}" x="720" y="120" width="360" height="360" preserveAspectRatio="xMidYMid meet"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#1a1a2e"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="120" y="300" font-family="Pretendard, sans-serif" font-size="120" font-weight="800" fill="#fff">${typeCode}</text>
  <text x="122" y="380" font-family="Pretendard, sans-serif" font-size="44" fill="#fff" opacity="0.9">${label}</text>
  <text x="122" y="560" font-family="Pretendard, sans-serif" font-size="28" fill="#fff" opacity="0.7">마인드타입 · ${gender === 'M' ? '남성' : '여성'} 버전</text>
  ${img}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
}
