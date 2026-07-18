// gen-characters.mjs — 마인드타입 16유형 × 남/여 캐릭터 SVG 생성기 (시안 v0.9)
// PRD §6.2~6.5 / _workspace/01_designer_design-system.md 정합.
// 완전 오리지널 파라메트릭 벡터. 타 서비스/실존 IP 모작 금지(§15).
//
// 실행:  node scripts/gen-characters.mjs
// 출력:  public/characters/{TYPE}_{M|F}.svg  (32종)
//
// 레이어 그룹: bg / body / head / hair / badge / type  (§6.3 확장성)
// viewBox 0 0 480 560 (§6.4 카드 규격) · 자기완결(외부 폰트·이미지 참조 없음)

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "public", "characters");
mkdirSync(OUT, { recursive: true });

/* ─────────────────────────────────────────────────────────
   1. 기질 4그룹 컬러 (§6.2 · 디자인시스템 §1.2)
   ───────────────────────────────────────────────────────── */
const TEMP = {
  NT: { name: "분석가", main: "#7C5CBF", tint: "#F1EBFA" },
  NF: { name: "외교관", main: "#43A868", tint: "#E9F7EE" },
  SJ: { name: "관리자", main: "#3399A8", tint: "#E6F4F6" },
  SP: { name: "탐험가", main: "#E3A430", tint: "#FCF3DF" },
};

/* ─────────────────────────────────────────────────────────
   2. 16유형 정의 (§6.5 별칭·뱃지 상징)
   ───────────────────────────────────────────────────────── */
const TYPES = [
  { code: "INTJ", alias: "건축가",   temp: "NT", badge: "setsquare" },
  { code: "INTP", alias: "논리술사", temp: "NT", badge: "flask" },
  { code: "ENTJ", alias: "통솔자",   temp: "NT", badge: "flag" },
  { code: "ENTP", alias: "변론가",   temp: "NT", badge: "bubble" },
  { code: "INFJ", alias: "옹호자",   temp: "NF", badge: "sprout" },
  { code: "INFP", alias: "중재자",   temp: "NF", badge: "flower" },
  { code: "ENFJ", alias: "선도자",   temp: "NF", badge: "star" },
  { code: "ENFP", alias: "활동가",   temp: "NF", badge: "sun" },
  { code: "ISTJ", alias: "현실주의자", temp: "SJ", badge: "checklist" },
  { code: "ISFJ", alias: "수호자",   temp: "SJ", badge: "shield" },
  { code: "ESTJ", alias: "경영자",   temp: "SJ", badge: "briefcase" },
  { code: "ESFJ", alias: "집정관",   temp: "SJ", badge: "cake" },
  { code: "ISTP", alias: "장인",     temp: "SP", badge: "wrench" },
  { code: "ISFP", alias: "모험가",   temp: "SP", badge: "palette" },
  { code: "ESTP", alias: "사업가",   temp: "SP", badge: "bolt" },
  { code: "ESFP", alias: "연예인",   temp: "SP", badge: "note" },
];

// 통일감 속 개성 — 인덱스로 순환하는 피부/헤어 톤(M/F 동일, §6.3)
const SKIN = ["#F2CBA6", "#EAB98E", "#DDA679", "#F0C29B"];
const HAIR = ["#3A2E2A", "#4E362A", "#2B2A33", "#5E4636"];

/* ─────────────────────────────────────────────────────────
   3. 색 유틸
   ───────────────────────────────────────────────────────── */
const INK = "#17263B";
function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t));
}
const darken = (c, t = 0.22) => mix(c, INK, t);
const lighten = (c, t = 0.5) => mix(c, "#FFFFFF", t);

/* ─────────────────────────────────────────────────────────
   4. 뱃지 상징 아이콘 (흰색, 뱃지 중심 bx,by 기준 · §6.5)
      뱃지 반경 ~46, 아이콘은 ±26 범위. main=강조용 소액센트.
   ───────────────────────────────────────────────────────── */
function symbol(kind, bx, by, main) {
  const W = "#FFFFFF";
  const s = (d, extra = "") => `<path d="${d}" ${extra}/>`;
  const st = `fill="none" stroke="${W}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case "setsquare": // 설계 삼각자
      return s(`M${bx-22} ${by-16} L${bx-22} ${by+20} L${bx+22} ${by+20} Z`, st) +
             s(`M${bx-14} ${by+12} L${bx-14} ${by+20}`, `stroke="${W}" stroke-width="3" stroke-linecap="round"`) +
             s(`M${bx-6} ${by+12} L${bx-6} ${by+20}`, `stroke="${W}" stroke-width="3" stroke-linecap="round"`);
    case "flask": // 플라스크
      return s(`M${bx-6} ${by-22} L${bx-6} ${by-6} L${bx-18} ${by+18} Q${bx-18} ${by+22} ${bx-14} ${by+22} L${bx+14} ${by+22} Q${bx+18} ${by+22} ${bx+18} ${by+18} L${bx+6} ${by-6} L${bx+6} ${by-22}`, st) +
             s(`M${bx-10} ${by-22} L${bx+10} ${by-22}`, `stroke="${W}" stroke-width="5" stroke-linecap="round"`) +
             `<circle cx="${bx-4}" cy="${by+12}" r="2.6" fill="${main}"/><circle cx="${bx+5}" cy="${by+6}" r="2" fill="${main}"/>`;
    case "flag": // 깃발
      return s(`M${bx-14} ${by-22} L${bx-14} ${by+22}`, st) +
             s(`M${bx-14} ${by-20} L${bx+18} ${by-11} L${bx-14} ${by-2} Z`, `fill="${W}"`);
    case "bubble": // 말풍선
      return `<rect x="${bx-22}" y="${by-18}" width="44" height="30" rx="9" fill="${W}"/>` +
             s(`M${bx-10} ${by+10} L${bx-18} ${by+22} L${bx-2} ${by+10} Z`, `fill="${W}"`) +
             `<circle cx="${bx-9}" cy="${by-3}" r="2.6" fill="${main}"/><circle cx="${bx}" cy="${by-3}" r="2.6" fill="${main}"/><circle cx="${bx+9}" cy="${by-3}" r="2.6" fill="${main}"/>`;
    case "sprout": // 새싹 잎
      return s(`M${bx} ${by+22} L${bx} ${by-4}`, st) +
             `<path d="M${bx} ${by} Q${bx-20} ${by-6} ${bx-20} ${by-22} Q${bx-4} ${by-20} ${bx} ${by}" fill="${W}"/>` +
             `<path d="M${bx} ${by-6} Q${bx+20} ${by-12} ${bx+20} ${by-26} Q${bx+4} ${by-24} ${bx} ${by-6}" fill="${W}"/>`;
    case "flower": { // 꽃
      let p = "";
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const px = bx + Math.cos(a) * 14, py = by + Math.sin(a) * 14;
        p += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="8" fill="${W}"/>`;
      }
      return p + `<circle cx="${bx}" cy="${by}" r="7" fill="${main}"/>`;
    }
    case "star": { // 별
      let d = "";
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 24 : 10;
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        d += (i === 0 ? "M" : "L") + `${(bx + Math.cos(a) * r).toFixed(1)} ${(by + Math.sin(a) * r).toFixed(1)} `;
      }
      return s(d + "Z", `fill="${W}"`);
    }
    case "sun": { // 태양
      let rays = "";
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        rays += s(`M${(bx + Math.cos(a) * 16).toFixed(1)} ${(by + Math.sin(a) * 16).toFixed(1)} L${(bx + Math.cos(a) * 24).toFixed(1)} ${(by + Math.sin(a) * 24).toFixed(1)}`, `stroke="${W}" stroke-width="4.5" stroke-linecap="round"`);
      }
      return `<circle cx="${bx}" cy="${by}" r="12" fill="${W}"/>` + rays;
    }
    case "checklist": // 체크리스트
      return `<rect x="${bx-17}" y="${by-22}" width="34" height="44" rx="5" fill="${W}"/>` +
             `<rect x="${bx-6}" y="${by-26}" width="12" height="7" rx="2" fill="${W}"/>` +
             s(`M${bx-11} ${by-8} l4 4 l7 -8`, `fill="none" stroke="${main}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`) +
             s(`M${bx-11} ${by+8} l4 4 l7 -8`, `fill="none" stroke="${main}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`);
    case "shield": // 방패 체크
      return s(`M${bx} ${by-24} L${bx+18} ${by-15} L${bx+18} ${by+2} Q${bx+18} ${by+18} ${bx} ${by+25} Q${bx-18} ${by+18} ${bx-18} ${by+2} L${bx-18} ${by-15} Z`, `fill="${W}"`) +
             s(`M${bx-8} ${by-1} l6 7 l11 -13`, `fill="none" stroke="${main}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`);
    case "briefcase": // 서류가방
      return `<rect x="${bx-22}" y="${by-8}" width="44" height="30" rx="5" fill="${W}"/>` +
             s(`M${bx-9} ${by-8} L${bx-9} ${by-16} Q${bx-9} ${by-19} ${bx-6} ${by-19} L${bx+6} ${by-19} Q${bx+9} ${by-19} ${bx+9} ${by-16} L${bx+9} ${by-8}`, `fill="none" stroke="${W}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`) +
             `<rect x="${bx-22}" y="${by+3}" width="44" height="4" fill="${main}"/>`;
    case "cake": // 케이크
      return `<rect x="${bx-20}" y="${by-2}" width="40" height="22" rx="5" fill="${W}"/>` +
             `<rect x="${bx-20}" y="${by+7}" width="40" height="4" fill="${main}"/>` +
             s(`M${bx} ${by-2} L${bx} ${by-16}`, `stroke="${W}" stroke-width="4" stroke-linecap="round"`) +
             `<circle cx="${bx}" cy="${by-20}" r="4" fill="${W}"/>`;
    case "wrench": // 렌치
      return s(`M${bx+10} ${by-20} a11 11 0 1 0 6 12 L${bx-14} ${by+18} a6 6 0 0 1 -8 -8 L${bx+2} ${by-14} a11 11 0 0 1 8 -6 Z`, `fill="${W}"`) +
             `<circle cx="${bx+7}" cy="${by-11}" r="4.5" fill="${main}"/>`;
    case "palette": { // 팔레트
      let dots = `<circle cx="${bx+9}" cy="${by+6}" r="4" fill="${main}"/>`;
      const cols = [lighten(main, .1), "#FFFFFF", darken(main, .1)];
      [[bx-9, by-6], [bx+2, by-9], [bx-11, by+5]].forEach((p, i) => { dots += `<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="${cols[i]}"/>`; });
      return `<path d="M${bx} ${by-20} Q${bx+22} ${by-20} ${bx+22} ${by+2} Q${bx+22} ${by+16} ${bx+6} ${by+18} Q${bx+12} ${by+8} ${bx+2} ${by+9} Q${bx-24} ${by+11} ${bx-22} ${by-6} Q${bx-20} ${by-20} ${bx} ${by-20} Z" fill="${W}"/>` + dots;
    }
    case "bolt": // 번개
      return s(`M${bx+8} ${by-22} L${bx-14} ${by+3} L${bx-2} ${by+3} L${bx-7} ${by+22} L${bx+15} ${by-5} L${bx+2} ${by-5} Z`, `fill="${W}"`);
    case "note": // 음표
      return `<ellipse cx="${bx-8}" cy="${by+14}" rx="10" ry="8" transform="rotate(-18 ${bx-8} ${by+14})" fill="${W}"/>` +
             s(`M${bx+1} ${by+14} L${bx+1} ${by-20}`, `stroke="${W}" stroke-width="4.5" stroke-linecap="round"`) +
             `<path d="M${bx+1} ${by-20} Q${bx+16} ${by-16} ${bx+14} ${by-2} Q${bx+13} ${by-11} ${bx+1} ${by-11} Z" fill="${W}"/>`;
    default:
      return `<circle cx="${bx}" cy="${by}" r="14" fill="${W}"/>`;
  }
}

/* ─────────────────────────────────────────────────────────
   5. 캐릭터 조립 — 한 유형×성별 SVG
   ───────────────────────────────────────────────────────── */
function build(type, gender, idx) {
  const t = TEMP[type.temp];
  const main = t.main, tint = t.tint;
  const skin = SKIN[idx % SKIN.length];
  const hair = HAIR[idx % HAIR.length];
  const garment = main;
  const collar = darken(main, 0.3);
  const cheek = "#EFA7A0";
  const isF = gender === "F";
  const genderLabel = isF ? "여성" : "남성";

  const cx = 240;          // 얼굴 중심 x
  const hy = 232;          // 얼굴 중심 y
  const hr = 96;           // 얼굴 반경
  const bx = 384, by = 112, br = 46; // 뱃지

  /* --- bg: 라운드 배경 + 헤일로 --- */
  const bg = `<g id="bg">
    <rect x="0" y="0" width="480" height="560" rx="36" fill="${tint}"/>
    <circle cx="${cx}" cy="${hy+6}" r="150" fill="#FFFFFF" opacity="0.42"/>
    <ellipse cx="${cx}" cy="548" rx="210" ry="70" fill="${lighten(main,0.72)}" opacity="0.6"/>
  </g>`;

  /* --- 긴 머리 뒷단(F): body보다 먼저, bg 위 --- */
  const hairBack = isF
    ? `<g id="hair-back">
        <path d="M${cx-92} ${hy-6} Q${cx-128} ${hy+120} ${cx-96} ${hy+220} L${cx-58} ${hy+220} Q${cx-74} ${hy+120} ${cx-70} ${hy+30} Z" fill="${darken(hair,0.12)}"/>
        <path d="M${cx+92} ${hy-6} Q${cx+128} ${hy+120} ${cx+96} ${hy+220} L${cx+58} ${hy+220} Q${cx+74} ${hy+120} ${cx+70} ${hy+30} Z" fill="${darken(hair,0.12)}"/>
      </g>`
    : "";

  /* --- body: 어깨/상의 --- */
  const bodyTop = hy + hr + 4; // ~332
  const body = `<g id="body">
    <rect x="${cx-22}" y="${hy+hr-30}" width="44" height="56" rx="16" fill="${skin}"/>
    <path d="M${cx-160} 560 L${cx-160} ${bodyTop+80}
             Q${cx-158} ${bodyTop+8} ${cx-70} ${bodyTop-6}
             Q${cx} ${bodyTop-14} ${cx+70} ${bodyTop-6}
             Q${cx+158} ${bodyTop+8} ${cx+160} ${bodyTop+80}
             L${cx+160} 560 Z" fill="${garment}"/>
    <path d="M${cx-70} ${bodyTop-6} Q${cx} ${bodyTop-14} ${cx+70} ${bodyTop-6}
             L${cx+70} ${bodyTop+18} Q${cx} ${bodyTop+6} ${cx-70} ${bodyTop+18} Z" fill="${collar}"/>
  </g>`;

  /* --- 액세서리: M=넥타이, F=브로치(꽃) · §6.3 (동일 구도·크기) --- */
  const neckCX = cx, neckY = bodyTop + 2;
  const accessory = isF
    ? `<g id="accessory">
        <path d="M${cx-30} ${bodyTop+2} L${cx} ${bodyTop+40} L${cx+30} ${bodyTop+2} Z" fill="#FFFFFF" opacity="0.9"/>
        ${(() => { // 꽃 브로치
          let f = "";
          for (let i = 0; i < 5; i++) { const a = (i/5)*Math.PI*2 - Math.PI/2; f += `<circle cx="${(cx+34+Math.cos(a)*9).toFixed(1)}" cy="${(bodyTop+30+Math.sin(a)*9).toFixed(1)}" r="6" fill="${lighten(main,0.25)}"/>`; }
          return f + `<circle cx="${cx+34}" cy="${bodyTop+30}" r="5" fill="${main}"/>`;
        })()}
      </g>`
    : `<g id="accessory">
        <path d="M${cx-30} ${bodyTop+2} L${cx} ${bodyTop+40} L${cx+30} ${bodyTop+2} Z" fill="#FFFFFF" opacity="0.9"/>
        <path d="M${cx-9} ${bodyTop+6} L${cx} ${bodyTop+16} L${cx+9} ${bodyTop+6} L${cx+5} ${bodyTop+2} L${cx-5} ${bodyTop+2} Z" fill="${collar}"/>
        <path d="M${cx-7} ${bodyTop+16} L${cx+7} ${bodyTop+16} L${cx+11} ${bodyTop+64} L${cx} ${bodyTop+74} L${cx-11} ${bodyTop+64} Z" fill="${collar}"/>
      </g>`;

  /* --- head: 얼굴 + 이목구비 --- */
  const eyeY = hy + 6, eyeDx = 30, eyeR = 7.5;
  const head = `<g id="head">
    <ellipse cx="${cx-hr+6}" cy="${hy+14}" rx="14" ry="18" fill="${skin}"/>
    <ellipse cx="${cx+hr-6}" cy="${hy+14}" rx="14" ry="18" fill="${skin}"/>
    <circle cx="${cx}" cy="${hy}" r="${hr}" fill="${skin}"/>
    <circle cx="${cx-58}" cy="${hy+30}" r="15" fill="${cheek}" opacity="0.30"/>
    <circle cx="${cx+58}" cy="${hy+30}" r="15" fill="${cheek}" opacity="0.30"/>
    <ellipse cx="${cx-eyeDx}" cy="${eyeY}" rx="${eyeR}" ry="${eyeR+1.5}" fill="#31303A"/>
    <ellipse cx="${cx+eyeDx}" cy="${eyeY}" rx="${eyeR}" ry="${eyeR+1.5}" fill="#31303A"/>
    <circle cx="${cx-eyeDx+2.4}" cy="${eyeY-2.6}" r="2.2" fill="#FFFFFF"/>
    <circle cx="${cx+eyeDx+2.4}" cy="${eyeY-2.6}" r="2.2" fill="#FFFFFF"/>
    <path d="M${cx-eyeDx-9} ${eyeY-16} q9 -6 18 0" fill="none" stroke="${darken(hair,0.1)}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M${cx+eyeDx-9} ${eyeY-16} q9 -6 18 0" fill="none" stroke="${darken(hair,0.1)}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M${cx-3} ${eyeY+12} q3 5 6 0" fill="none" stroke="${darken(skin,0.28)}" stroke-width="3" stroke-linecap="round"/>
    <path d="M${cx-15} ${eyeY+30} q15 14 30 0" fill="none" stroke="#B9605C" stroke-width="4" stroke-linecap="round"/>
  </g>`;

  /* --- hair(앞단): M=짧은 캡 / F=긴머리 앞가닥 + 캡 (§6.3 헤어만 차등) --- */
  const capTop = hy - hr - 10;
  const cap = `<path d="M${cx-hr-2} ${hy+6}
        Q${cx-hr-6} ${capTop+30} ${cx-52} ${capTop+8}
        Q${cx} ${capTop-14} ${cx+52} ${capTop+8}
        Q${cx+hr+6} ${capTop+30} ${cx+hr+2} ${hy+6}
        Q${cx+hr-14} ${hy-28} ${cx+40} ${hy-30}
        Q${cx+18} ${hy-14} ${cx} ${hy-22}
        Q${cx-20} ${hy-14} ${cx-40} ${hy-30}
        Q${cx-hr+14} ${hy-28} ${cx-hr-2} ${hy+6} Z" fill="${hair}"/>`;
  const hairFront = isF
    ? `<g id="hair">
        ${cap}
        <path d="M${cx-hr-2} ${hy+2} Q${cx-hr-10} ${hy+70} ${cx-hr+6} ${hy+96} L${cx-hr+22} ${hy+92} Q${cx-hr+2} ${hy+50} ${cx-hr+10} ${hy+4} Z" fill="${hair}"/>
        <path d="M${cx+hr+2} ${hy+2} Q${cx+hr+10} ${hy+70} ${cx+hr-6} ${hy+96} L${cx+hr-22} ${hy+92} Q${cx+hr-2} ${hy+50} ${cx+hr-10} ${hy+4} Z" fill="${hair}"/>
      </g>`
    : `<g id="hair">${cap}</g>`;

  /* --- badge: 우상단 원형 뱃지 (§6.5) --- */
  const badge = `<g id="badge">
    <circle cx="${bx}" cy="${by}" r="${br+5}" fill="#FFFFFF"/>
    <circle cx="${bx}" cy="${by}" r="${br}" fill="${main}"/>
    ${symbol(type.badge, bx, by, main)}
  </g>`;

  /* --- type: 유형 코드 텍스트 병기 (§6.4 접근성) --- */
  const chipW = 168, chipH = 44, chipY = 494;
  const label = `<g id="type">
    <rect x="${cx-chipW/2}" y="${chipY}" width="${chipW}" height="${chipH}" rx="22" fill="#FFFFFF"/>
    <rect x="${cx-chipW/2+1}" y="${chipY+1}" width="${chipW-2}" height="${chipH-2}" rx="21" fill="none" stroke="${mix(main,'#FFFFFF',0.55)}" stroke-width="1.5"/>
    <circle cx="${cx-chipW/2+22}" cy="${chipY+chipH/2}" r="6" fill="${main}"/>
    <text x="${cx+8}" y="${chipY+chipH/2+1}" text-anchor="middle" dominant-baseline="central"
      font-family="ui-monospace,'Cascadia Code',Consolas,monospace" font-size="20" font-weight="800"
      letter-spacing="3" fill="${INK}">${type.code}</text>
  </g>`;

  const title = `${type.code} ${type.alias} 캐릭터 (${genderLabel} 버전)`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 560" width="480" height="560" role="img" aria-label="${title}">
  <title>${title}</title>
  <desc>마인드타입 자체 제작 플랫 벡터 캐릭터 시안 v0.9 · ${TEMP[type.temp].name} 기질(${type.temp})</desc>
  <defs><clipPath id="card"><rect x="0" y="0" width="480" height="560" rx="36"/></clipPath></defs>
  <g clip-path="url(#card)">
    ${bg}
    ${hairBack}
    ${body}
    ${accessory}
    ${head}
    ${hairFront}
    ${badge}
    ${label}
  </g>
</svg>
`;
}

/* ─────────────────────────────────────────────────────────
   6. 32종 일괄 생성
   ───────────────────────────────────────────────────────── */
let n = 0;
for (let i = 0; i < TYPES.length; i++) {
  for (const g of ["M", "F"]) {
    const svg = build(TYPES[i], g, i);
    writeFileSync(resolve(OUT, `${TYPES[i].code}_${g}.svg`), svg, "utf8");
    n++;
  }
}
console.log(`generated ${n} SVGs → ${OUT}`);
