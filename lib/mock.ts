/**
 * 계약 타입 기준 목 데이터 — 개발 데모용(opt-in). 기본 비활성.
 * 모든 반환값은 @contract shape을 100% 준수한다(제네릭 캐스팅·임의 필드 금지).
 * NEXT_PUBLIC_USE_MOCK='true'일 때만 lib/api.ts가 이 파일을 사용하며,
 * 활성 시 전역 배지(MockBadge)가 표시된다. 문항은 소수 템플릿의 순환 복제라
 * 반복 노출됨 — 실 검사 대체 불가(재발 방지 조치의 배경).
 */
import {
  PRODUCT_ITEM_COUNT, TIER_SCALE, SECTION_MATRIX, UPGRADE_BANNER, FUNCTION_STACK,
  type Product, type AvatarVersion, type TypeCode, type Dimension, type Pole,
  type FacetKey, type ClarityBand, type FacetZone,
  type PublicQuestion, type Question, type Result, type Clarity, type Facets,
  type ReportContentBlock, type CharacterAsset, type SectionVisibility, type SectionAvail,
  type CreateSessionRequest, type CreateSessionResponse, type ResumeStateResponse,
  type SaveResponsesRequest, type SaveResponsesResponse,
  type UpgradeSessionRequest, type UpgradeSessionResponse,
  type SubmitResponse, type ResultViewResponse, type QuestionsResponse, type AssetsResponse,
} from '@contract';
import { TYPE_NICKNAME, GRID16_ORDER, temperamentOf, FACET_DEFS } from './report/typeMeta';

const QSET_VERSION = 1;
const DIMS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];
const FACET_KEYS = FACET_DEFS.flatMap((g) => g.rows.map((r) => r.key as FacetKey));

/* ── 문항 생성(결정적) ── */
const STEMS = [
  '나는 여러 사람과 어울릴 때 에너지를 얻는 편이다',
  '나는 계획을 미리 세워두면 마음이 편하다',
  '나는 사실과 근거를 먼저 확인한 뒤 판단한다',
  '나는 다른 사람의 감정 변화를 잘 알아챈다',
  '나는 새로운 가능성을 상상하는 것을 즐긴다',
  '나는 결정을 내릴 때 논리적 일관성을 중시한다',
];
const WORD_PAIRS: [string, string][] = [
  ['활기찬', '차분한'], ['현실적', '창의적'], ['논리', '공감'], ['계획', '즉흥'],
  ['사실', '의미'], ['주도', '경청'], ['체계', '유연'], ['확실', '가능성'],
];

function makeQuestion(i: number, product: Product): Question {
  const dim = DIMS[i % 4];
  const part = ((Math.floor(i / Math.ceil(PRODUCT_ITEM_COUNT[product].total / 5)) % 5) + 1) as 1 | 2 | 3 | 4 | 5;
  const isWord = i % 3 === 2; // 1/3 단어쌍
  const code = 'Q' + String(i + 1).padStart(3, '0');
  if (isWord) {
    const [a, b] = WORD_PAIRS[i % WORD_PAIRS.length];
    return {
      questionId: code, code, part, format: 'word_pair', dimension: dim,
      stem: null, textA: a, textB: b, version: 1, questionSetVersion: QSET_VERSION,
    };
  }
  const stem = STEMS[i % STEMS.length];
  return {
    questionId: code, code, part, format: 'sentence', dimension: dim,
    stem, textA: '그렇다', textB: '아니다', version: 1, questionSetVersion: QSET_VERSION,
  };
}

function toPublic(q: Question): PublicQuestion {
  return { questionId: q.questionId, code: q.code, part: q.part, format: q.format, stem: q.stem, textA: q.textA, textB: q.textB };
}

export function buildQuestions(product: Product): PublicQuestion[] {
  const total = PRODUCT_ITEM_COUNT[product].total;
  return Array.from({ length: total }, (_, i) => toPublic(makeQuestion(i, product)));
}

/* ── 결과 생성 ── */
function bandFor(percent: number): ClarityBand {
  if (percent >= 76) return 'very_clear';
  if (percent >= 66) return 'clear';
  if (percent >= 56) return 'moderate';
  return 'slight';
}

function makeClarity(type: TypeCode, product: Product): Clarity {
  const max = TIER_SCALE[product].max;
  // 유형 각 글자 → 극/점수(데모용 결정적 값)
  const letters = type.split('');
  const dimPole: Record<Dimension, Pole> = {
    EI: letters[0] === 'E' ? 'L' : 'R',
    SN: letters[1] === 'S' ? 'L' : 'R',
    TF: letters[2] === 'T' ? 'L' : 'R',
    JP: letters[3] === 'J' ? 'L' : 'R',
  };
  const frac: Record<Dimension, number> = { EI: 0.7, SN: 0.85, TF: 0.55, JP: 0.4 };
  const out = {} as Clarity;
  for (const d of DIMS) {
    const percent = 50 + Math.round(frac[d] * 45); // 50~95
    out[d] = { pole: dimPole[d], score: Math.round(frac[d] * max), band: bandFor(percent), percent };
  }
  return out;
}

function makeFacets(): Facets {
  const out = {} as Facets;
  FACET_KEYS.forEach((key, i) => {
    const score = (i % 6) as 0 | 1 | 2 | 3 | 4 | 5;
    const side: Pole = i % 2 === 0 ? 'L' : 'R';
    const zone: FacetZone = score <= 1 ? 'in_pref' : score <= 3 ? 'midrange' : 'out_pref';
    out[key] = { side, score, zone };
  });
  return out;
}

function buildSections(product: Product): SectionVisibility {
  const sections: Record<string, SectionAvail> = {};
  for (const key of Object.keys(SECTION_MATRIX)) sections[key] = SECTION_MATRIX[key][product];
  return {
    product,
    scale: { ...TIER_SCALE[product] },
    sections,
    upgradeTargets: [...UPGRADE_BANNER[product]],
  };
}

export function makeResult(product: Product, gender: AvatarVersion, type: TypeCode, sessionId: string, resultToken: string): Result {
  const isPro = product === 'pro';
  return {
    resultToken, sessionId,
    typeCode: type, product, avatarVersion: gender,
    scores: { E: 22, I: 10, S: 8, N: 28, T: 14, F: 24, J: 12, P: 26 },
    clarity: makeClarity(type, product),
    functionStack: FUNCTION_STACK[type],
    facets: isPro ? makeFacets() : null,
    clarityIndex: isPro ? 58 : null,
    omittedCount: 0,
    tieBreakApplied: [],
    reportVersion: 1,
    scoredAt: new Date().toISOString(),
  };
}

/* ── 리포트 콘텐츠 블록(부록 D minProduct 반영) ── */
function makeContent(type: TypeCode): ReportContentBlock[] {
  const nick = TYPE_NICKNAME[type];
  const b = (blockKey: string, body: unknown, minProduct: Product, facetKey: FacetKey | null = null): ReportContentBlock =>
    ({ typeCode: type, blockKey, facetKey, body, minProduct, version: 1 });

  const blocks: ReportContentBlock[] = [
    b('nickname', `${nick} — 열정과 가능성으로 사람과 세상을 연결하는 사람들`, 'basic'),
    b('keywords', ['열정', '가능성', '공감', '창의', '자율', '연결', '호기심', '즉흥', '낙천', '영감'], 'basic'),
    b('narrative',
      `${type}(${nick})은 새로운 가능성에 민감하게 반응하며, 사람과 아이디어를 잇는 데서 에너지를 얻습니다. ` +
      '정보를 인식할 때는 사실 이면의 의미와 관계를 먼저 보고, 판단할 때는 개인과 사회의 가치를 중시합니다. ' +
      '자유롭고 개방적인 환경에서 잠재력이 살아나며, 반복적·경직된 절차에서는 쉽게 지칩니다.', 'standard'),
    b('strengths', ['빠른 공감과 관계 형성', '아이디어 발상과 연결', '변화에 대한 적응력', '동기 부여와 영감 전달', '넓은 관심사'], 'standard'),
    b('workEnv', ['자율성이 보장된 환경', '사람과 협업하는 프로젝트', '새로운 시도가 장려되는 문화', '의미 있는 목표', '유연한 일정'], 'standard'),
    b('relationships', ['따뜻하고 개방적인 태도', '상대의 잠재력을 알아봄', '갈등보다 조화 선호', '깊은 정서적 교류', '자유를 존중'], 'standard'),
    b('growth', ['세부 실행의 마무리', '우선순위 관리', '루틴 유지', '비판적 피드백 수용', '에너지 배분'], 'standard'),
    b('positive_dynamics',
      '주기능(Ne)이 부기능(Fi)의 가치 판단과 균형을 이룰 때, 다양한 가능성을 탐색하면서도 자신에게 진실한 선택을 합니다.', 'pro'),
    b('negative_dynamics',
      '편안한 기능(Ne)만 과용하면 아이디어를 벌여만 놓고 마무리하지 못하며, 스트레스 시 열등기능(Si)이 부적절하게 튀어나옵니다.', 'pro'),
    b('overuse', '가능성만 좇아 산만해지고 현실적 제약을 무시할 수 있습니다.', 'pro'),
    b('suppressed', '자율성이 억압되면 의욕과 집중이 급격히 떨어집니다.', 'pro'),
    b('ignored', '세부·규칙(Si)을 계속 무시하면 실수와 번복이 반복됩니다.', 'pro'),
    b('stress', '극심한 스트레스에서는 사소한 사실에 집착하거나 신체 감각에 과민해집니다.', 'pro'),
    b('develop', ['하루 한 가지 마무리 습관', '핵심 목표 3개로 좁히기', '루틴을 자유의 도구로 재해석'], 'pro'),
    b('examiner_opinion',
      '응답 일관성 양호. 직관·감정 선호가 뚜렷하며 생활양식(J/P)은 상황 유연성이 큼. ' +
      '경계선 지표는 없으나 실행·마무리 영역의 자기관리 코칭을 권장합니다.', 'pro'),
  ];

  // 다면척도 20종 해설(pro)
  for (const g of FACET_DEFS) {
    for (const r of g.rows) {
      blocks.push(b(`facet_expl`, `${r.l}/${r.r} 척도: 개인의 응답이 ${r.l} 쪽 경향을 보입니다. ${r.ld}.`, 'pro', r.key as FacetKey));
    }
  }
  return blocks;
}

/* ── 캐릭터 에셋(플레이스홀더, §6.4 규칙) ── */
function makeAssets(type: TypeCode, gender: AvatarVersion): CharacterAsset[] {
  const nick = TYPE_NICKNAME[type];
  const temp = temperamentOf(type);
  const genderKo = gender === 'M' ? '남성' : '여성';
  const variants: CharacterAsset['variant'][] = ['card', 'avatar', 'og'];
  return variants.map((variant) => ({
    typeCode: type, gender, variant,
    fileUrl: '', // 실에셋 부재 → 프론트 플레이스홀더 렌더
    fileName: `${type}_${gender}`,
    altText: `${type} ${nick} 캐릭터 (${genderKo} 버전)`,
    temperament: temp, version: 1,
  }));
}

/* ══════════ 토큰 인코딩(자기서술) — 목 상태 무의존 ══════════ */
const DEMO_TYPE: TypeCode = 'ENFP';
function enc(...parts: (string | number)[]) { return parts.join('.'); }
function parseSession(id: string): { product: Product; gender: AvatarVersion } {
  const [, product, gender] = id.split('.');
  return { product: (product as Product) ?? 'pro', gender: (gender as AvatarVersion) ?? 'F' };
}
function parseResult(token: string): { product: Product; gender: AvatarVersion; type: TypeCode } {
  const [, product, gender, type] = token.split('.');
  return {
    product: (['basic', 'standard', 'pro'].includes(product) ? product : 'pro') as Product,
    gender: (gender as AvatarVersion) ?? 'F',
    type: (type && (GRID16_ORDER as string[]).includes(type) ? type : DEMO_TYPE) as TypeCode,
  };
}

/* ══════════ 엔드포인트 목 구현 ══════════ */
export async function createSession(req: CreateSessionRequest): Promise<CreateSessionResponse> {
  const sessionId = enc('sess', req.product, req.avatarVersion, Math.random().toString(36).slice(2, 8));
  return {
    sessionId,
    resumeToken: enc('resume', req.product, req.avatarVersion, sessionId.split('.')[3]),
    questionSetVersion: QSET_VERSION,
    product: req.product,
    total: PRODUCT_ITEM_COUNT[req.product].total,
  };
}

export async function getResumeState(token: string): Promise<ResumeStateResponse> {
  const [, product, gender] = token.split('.');
  const p = (product as Product) ?? 'pro';
  return {
    sessionId: enc('sess', p, gender ?? 'F', 'resumed'),
    product: p, avatarVersion: (gender as AvatarVersion) ?? 'F',
    answered: 0, total: PRODUCT_ITEM_COUNT[p].total,
    nextQuestionId: null, status: 'in_progress',
  };
}

export async function getQuestions(product: Product, _version?: number): Promise<QuestionsResponse> {
  return { questionSetVersion: QSET_VERSION, product, total: PRODUCT_ITEM_COUNT[product].total, questions: buildQuestions(product) };
}

export async function saveResponses(sessionId: string, req: SaveResponsesRequest): Promise<SaveResponsesResponse> {
  const { product } = parseSession(sessionId);
  const total = PRODUCT_ITEM_COUNT[product].total;
  const answered = Math.min(req.answers.length, total);
  return { ok: true, saved: req.answers.length, answered, total };
}

export async function upgradeSession(sessionId: string, req: UpgradeSessionRequest): Promise<UpgradeSessionResponse> {
  const { product, gender } = parseSession(sessionId);
  const reused = PRODUCT_ITEM_COUNT[product].total;
  const toTotal = PRODUCT_ITEM_COUNT[req.toProduct].total;
  const newId = enc('sess', req.toProduct, gender, Math.random().toString(36).slice(2, 8));
  return {
    sessionId: newId,
    resumeToken: enc('resume', req.toProduct, gender, newId.split('.')[3]),
    product: req.toProduct,
    reusedCount: reused,
    remaining: Math.max(0, toTotal - reused),
    nextQuestionId: 'Q' + String(reused + 1).padStart(3, '0'),
  };
}

export async function submitSession(sessionId: string): Promise<SubmitResponse> {
  const { product, gender } = parseSession(sessionId);
  const resultToken = enc('res', product, gender, DEMO_TYPE, Math.random().toString(36).slice(2, 8));
  const result = makeResult(product, gender, DEMO_TYPE, sessionId, resultToken);
  return { result, redirectUrl: `/result/${resultToken}` };
}

export async function getResult(resultToken: string): Promise<ResultViewResponse> {
  const { product, gender, type } = parseResult(resultToken);
  const result = makeResult(product, gender, type, enc('sess', product, gender, 'demo'), resultToken);
  const allContent = makeContent(type);
  // 서버가 minProduct ≤ product 인 블록만 필터(계약 §GET /results)
  const rank: Record<Product, number> = { basic: 0, standard: 1, pro: 2 };
  const content = allContent.filter((c) => rank[c.minProduct] <= rank[product]);
  return { result, content, assets: makeAssets(type, gender), sections: buildSections(product) };
}

export async function getAssets(type?: TypeCode | 'VERSION', gender?: AvatarVersion): Promise<AssetsResponse> {
  const genders: AvatarVersion[] = gender ? [gender] : ['M', 'F'];
  const types: TypeCode[] = type && type !== 'VERSION' ? [type] : GRID16_ORDER;
  return types.flatMap((t) => genders.flatMap((g) => makeAssets(t, g)));
}
