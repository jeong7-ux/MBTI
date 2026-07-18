import type { TypeCode, Function8, Dimension, Pole } from '@contract';

/** 16유형 별칭(표준양식 grid16 원문 그대로). */
export const TYPE_NICKNAME: Record<TypeCode, string> = {
  ISTJ: '세상의 소금형', ISFJ: '임금 뒤편의 권력형', INFJ: '예언자형', INTJ: '과학자형',
  ISTP: '백과사전형', ISFP: '성인군자형', INFP: '잔다르크형', INTP: '아이디어 뱅크형',
  ESTP: '수완좋은 활동가형', ESFP: '사교적인 유형', ENFP: '스파크형', ENTP: '발명가형',
  ESTJ: '사업가형', ESFJ: '친선도모형', ENFJ: '언변능숙형', ENTJ: '지도자형',
};

/** 표준양식 grid16 순서(4×4). */
export const GRID16_ORDER: TypeCode[] = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

export type Temperament = 'NT' | 'NF' | 'SJ' | 'SP';
export const TEMPERAMENT_LABEL: Record<Temperament, string> = {
  NT: '분석가', NF: '외교관', SJ: '관리자', SP: '탐험가',
};
export const TEMPERAMENT_VAR: Record<Temperament, string> = {
  NT: '--temp-nt', NF: '--temp-nf', SJ: '--temp-sj', SP: '--temp-sp',
};
export const TEMPERAMENT_TINT_VAR: Record<Temperament, string> = {
  NT: '--temp-nt-tint', NF: '--temp-nf-tint', SJ: '--temp-sj-tint', SP: '--temp-sp-tint',
};

/** 유형코드 → 기질(§6.2). NT=직관+사고 / NF=직관+감정 / SJ=감각+판단 / SP=감각+인식. */
export function temperamentOf(type: TypeCode): Temperament {
  const [, s, t, j] = type; // [E/I][S/N][T/F][J/P]
  if (s === 'N') return t === 'T' ? 'NT' : 'NF';
  return j === 'J' ? 'SJ' : 'SP';
}

/** 심리기능 한국어 라벨(§5.3). fn 원(circ) 안 표기용. */
export const FUNCTION_LABEL: Record<Function8, { ko: string; desc: string }> = {
  Se: { ko: '외향감각', desc: '현재의 경험·감각' },
  Si: { ko: '내향감각', desc: '축적된 경험·기억' },
  Ne: { ko: '외향직관', desc: '가능성·아이디어' },
  Ni: { ko: '내향직관', desc: '통찰·미래 그림' },
  Te: { ko: '외향사고', desc: '체계·효율·논리' },
  Ti: { ko: '내향사고', desc: '원리·분석·정합' },
  Fe: { ko: '외향감정', desc: '조화·관계·배려' },
  Fi: { ko: '내향감정', desc: '가치·신념·진정성' },
};

/** 4지표 극 라벨(표준양식 pole-lbl / idx-table 표기). L=첫글자, R=둘째글자. */
export const DIMENSION_POLES: Record<Dimension, { L: { code: string; ko: string }; R: { code: string; ko: string } }> = {
  EI: { L: { code: 'E', ko: '외향' }, R: { code: 'I', ko: '내향' } },
  SN: { L: { code: 'S', ko: '감각' }, R: { code: 'N', ko: '직관' } },
  TF: { L: { code: 'T', ko: '사고' }, R: { code: 'F', ko: '감정' } },
  JP: { L: { code: 'J', ko: '판단' }, R: { code: 'P', ko: '인식' } },
};

export const DIMENSIONS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];

/** 극 → 유형코드 문자(clarity 요약 배지 등). */
export function poleCode(dim: Dimension, pole: Pole): string {
  return DIMENSION_POLES[dim][pole].code;
}
export function poleKo(dim: Dimension, pole: Pole): string {
  return DIMENSION_POLES[dim][pole].ko;
}

export const CLARITY_BAND_KO: Record<string, string> = {
  very_clear: '매우분명', clear: '분명', moderate: '보통', slight: '약간',
};

/** 다면척도 20종 정의(표준양식 FACET_DEFS 그대로 이식). [dim, 좌극라벨, 우극라벨, rows[[key,좌,우,좌설명,우설명]]] */
export const FACET_DEFS: {
  dim: Dimension;
  left: string;
  right: string;
  rows: { key: string; l: string; r: string; ld: string; rd: string }[];
}[] = [
  {
    dim: 'EI', left: '외향 (E)', right: '내향 (I)',
    rows: [
      { key: 'EI1', l: '능동성', r: '수동성', ld: '먼저 나서는 · 대화를 주도하는', rd: '나서지 않는 · 소개받는' },
      { key: 'EI2', l: '표현적', r: '보유적', ld: '드러내는 · 말로 쉽게 표현하는', rd: '간직하는 · 아껴 두는' },
      { key: 'EI3', l: '다양한 관계', r: '밀접한 관계', ld: '폭넓은 교제', rd: '깊고 좁은 교제' },
      { key: 'EI4', l: '활동적', r: '반추적', ld: '참여하며 배우는', rd: '돌아보며 정리하는' },
      { key: 'EI5', l: '열성적', r: '정적', ld: '활기찬 · 왁자한', rd: '고요한 · 차분한' },
    ],
  },
  {
    dim: 'SN', left: '감각 (S)', right: '직관 (N)',
    rows: [
      { key: 'SN1', l: '구체적', r: '추상적', ld: '정확한 사실 그대로', rd: '비유적인 · 상징적인' },
      { key: 'SN2', l: '현실적', r: '창의적', ld: '분별 있는 · 사실 지향', rd: '가치가 풍부한 · 독창적인' },
      { key: 'SN3', l: '실용적', r: '개념적', ld: '결과 지향적인', rd: '아이디어 지향적인' },
      { key: 'SN4', l: '경험적', r: '이론적', ld: '손으로 해보는 · 실증적', rd: '패턴이나 상호관련성을 인식' },
      { key: 'SN5', l: '전통적', r: '독창적', ld: '익숙한 것을 신뢰하는', rd: '새로운 것을 시도하는' },
    ],
  },
  {
    dim: 'TF', left: '사고 (T)', right: '감정 (F)',
    rows: [
      { key: 'TF1', l: '논리적', r: '정서적', ld: '객관적 근거로 판단', rd: '개인적 가치로 판단' },
      { key: 'TF2', l: '이성적', r: '감성적', ld: '공정성을 추구하는', rd: '사람 중심의 배려' },
      { key: 'TF3', l: '질문지향', r: '협응지향', ld: '따져 보는 · 토론하는', rd: '동의하는 · 조화를 향하는' },
      { key: 'TF4', l: '비평적', r: '허용적', ld: '검토하고 지적하는', rd: '수용하고 격려하는' },
      { key: 'TF5', l: '강인한', r: '온건한', ld: '단호한 · 관철하는', rd: '부드러운 · 다독이는' },
    ],
  },
  {
    dim: 'JP', left: '판단 (J)', right: '인식 (P)',
    rows: [
      { key: 'JP1', l: '체계성', r: '유연성', ld: '질서 있는 · 구조적인', rd: '느긋한 · 여유 있는' },
      { key: 'JP2', l: '목표지향적', r: '개방적', ld: '미래 계획에 초점을 둔', rd: '현 상황에 초점을 둔' },
      { key: 'JP3', l: '조기착수', r: '임박착수', ld: '여유 있게 시작하는', rd: '마감에 동기화되는' },
      { key: 'JP4', l: '계획성', r: '자발성', ld: '정해진 순서를 원하는', rd: '다양성과 예외를 즐기는' },
      { key: 'JP5', l: '방법적', r: '과정적', ld: '과업을 계획하는 · 조직화된', rd: '일단 뛰어드는 · 임기응변적인' },
    ],
  },
];
