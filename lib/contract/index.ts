/**
 * 01 · API 계약 (SSOT) — 마인드타입
 * 상태: 확정 v1 · 2026-07-18 · architect
 * 소비자: backend-engineer(구현) / frontend-engineer(호출·렌더) / scoring-engineer(순수함수) / qa-integrator(교차검증)
 *
 * 규약:
 *  - 케이스: 전 필드 camelCase.
 *  - 래핑: 성공 응답은 payload를 그대로 반환(비래핑). 에러만 { error: ApiError } 래핑.
 *  - 극(Pole): 'L' = 첫글자(E/S/T/J), 'R' = 둘째글자(I/N/F/P). 표준양식 렌더 규약과 동일.
 *  - 계약 이탈은 architect만 승인. shape 변경은 이 파일을 통해서만.
 *
 * 이 파일은 그대로 컴파일 가능한 순수 타입/상수 모듈이다(런타임 의존 없음).
 */

/* ══════════════════════════════════════════════════════════
 * 1. 공용 열거형 / 원시 타입
 * ══════════════════════════════════════════════════════════ */
export type Dimension = 'EI' | 'SN' | 'TF' | 'JP';
export type Pole = 'L' | 'R';
export type Choice = 'A' | 'B';
export type QuestionFormat = 'sentence' | 'word_pair';
export type Product = 'basic' | 'standard' | 'pro';
export type AvatarVersion = 'M' | 'F';
export type AssetVariant = 'card' | 'avatar' | 'og';
export type Function8 = 'Se' | 'Si' | 'Ne' | 'Ni' | 'Te' | 'Ti' | 'Fe' | 'Fi';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type ClarityBand = 'very_clear' | 'clear' | 'moderate' | 'slight';
export type FacetZone = 'in_pref' | 'midrange' | 'out_pref'; // 선호 내 / 중간범위 / 선호 외

export type TypeCode =
  | 'ISTJ' | 'ISFJ' | 'INFJ' | 'INTJ' | 'ISTP' | 'ISFP' | 'INFP' | 'INTP'
  | 'ESTP' | 'ESFP' | 'ENFP' | 'ENTP' | 'ESTJ' | 'ESFJ' | 'ENFJ' | 'ENTJ';

export type FacetKey =
  | 'EI1' | 'EI2' | 'EI3' | 'EI4' | 'EI5'
  | 'SN1' | 'SN2' | 'SN3' | 'SN4' | 'SN5'
  | 'TF1' | 'TF2' | 'TF3' | 'TF4' | 'TF5'
  | 'JP1' | 'JP2' | 'JP3' | 'JP4' | 'JP5';

/* ══════════════════════════════════════════════════════════
 * 2. 도메인 모델 (DB 투영 · API 노출 shape)
 * ══════════════════════════════════════════════════════════ */

/** 문항(매핑표 SSOT 투영). 사용자 노출 시 정답/극은 서버 계산에만 쓰고 클라이언트에는 text_a/b만 필요. */
export interface Question {
  questionId: string;
  code: string;                 // 'Q001'
  part: 1 | 2 | 3 | 4 | 5;
  format: QuestionFormat;
  dimension: Dimension;
  stem: string | null;          // word_pair는 null
  textA: string;
  textB: string;
  version: number;
  questionSetVersion: number;
}

/** 클라이언트 응답용 축약(극/facet/product_tags 등 채점 메타 제외). */
export interface PublicQuestion {
  questionId: string;
  code: string;
  part: 1 | 2 | 3 | 4 | 5;
  format: QuestionFormat;
  stem: string | null;
  textA: string;
  textB: string;
}

/** 채점 입력 단위. */
export interface AnswerInput {
  questionId: string;
  choice: Choice;
  elapsedMs?: number;
  revisedCount?: number;
}

/** 지표별 선호 분명도 — 표준양식 DATA.clarity.* 로 무손실 변환. score 상한은 상품 스케일(8/18/30). */
export interface ClarityEntry {
  pole: Pole;          // 'L'(E/S/T/J) | 'R'(I/N/F/P)
  score: number;       // 0..(상품 max: basic 8 / standard 18 / pro 30)
  band: ClarityBand;   // 매우뚜렷/뚜렷/보통/가벼움 (§5.2)
  percent: number;     // 다수극 응답 비율 0..100 (band 산출 근거)
}
export type Clarity = Record<Dimension, ClarityEntry>;

/** 다면척도 1종 — 표준양식 DATA.facets.* 로 무손실 변환. pro 전용. */
export interface FacetEntry {
  side: Pole;          // 'L' | 'R'
  score: 0 | 1 | 2 | 3 | 4 | 5;
  zone: FacetZone;
}
export type Facets = Record<FacetKey, FacetEntry>;

/** 심리기능 위계(§5.3). */
export interface FunctionStack {
  dominant: Function8;
  auxiliary: Function8;
  tertiary: Function8;
  inferior: Function8;
}

export type DimensionScores = Record<'E'|'I'|'S'|'N'|'T'|'F'|'J'|'P', number>;

/**
 * 채점 결과 — 채점 순수함수의 산출이자 GET /results 응답 코어.
 * 표준양식 DATA{}를 상품별 노출 대상에 한해 무손실로 채운다.
 */
export interface Result {
  resultToken: string;            // 추측 불가(§10). GET /api/results/:resultToken
  sessionId: string;
  typeCode: TypeCode;             // DATA.myType
  product: Product;               // DATA.tier · 부록 D 섹션 노출 결정자
  avatarVersion: AvatarVersion;   // 캐릭터 개인화(채점 무관)
  scores: DimensionScores;        // 원점수 {E,I,S,N,T,F,J,P}
  clarity: Clarity;               // DATA.clarity (상품 스케일)
  functionStack: FunctionStack;   // fn1~4
  facets: Facets | null;          // DATA.facets — pro만, 그 외 null
  clarityIndex: number | null;    // 일관성 지수 0~100 (pro)
  omittedCount: number;
  tieBreakApplied: Dimension[];   // 동점 보정 적용 지표(투명 고지 R4/F-R4)
  reportVersion: number;
  scoredAt: string;               // ISO8601
}

/** 리포트 콘텐츠(서술 슬롯). Result와 조인해 표준양식 {{slot}} 렌더. */
export interface ReportContentBlock {
  typeCode: TypeCode;
  blockKey: string;               // 'nickname'|'keywords'|'narrative'|... (mapping_schema §3.5)
  facetKey: FacetKey | null;
  body: unknown;                  // string | string[] | 구조화 (blockKey별)
  minProduct: Product;            // 노출 최소 상품(부록 D)
  version: number;
}

/** 캐릭터 에셋(§6.4). */
export interface CharacterAsset {
  typeCode: TypeCode | 'VERSION';
  gender: AvatarVersion;
  variant: AssetVariant;
  fileUrl: string;
  fileName: string;               // '{TYPE}_{M|F}' 규칙
  altText: string;                // '{유형} {별칭} 캐릭터 ({성별} 버전)'
  temperament: 'NT' | 'NF' | 'SJ' | 'SP';
  version: number;
}

/* ══════════════════════════════════════════════════════════
 * 3. 에러 · 공용 응답
 * ══════════════════════════════════════════════════════════ */
export interface ApiError {
  code: string;                   // 'SESSION_NOT_FOUND' | 'INVALID_PRODUCT' | 'INCOMPLETE_RESPONSES' | ...
  message: string;
  details?: Record<string, unknown>;
}
export type ApiResult<T> = T | { error: ApiError };

/* ══════════════════════════════════════════════════════════
 * 4. 엔드포인트 요청/응답 (P0 최소 목록)
 * ══════════════════════════════════════════════════════════ */

/** POST /api/sessions — 검사 세션 시작(상품·버전 선택). */
export interface CreateSessionRequest {
  product: Product;
  avatarVersion: AvatarVersion;   // 명시적 선택 필수(F-09), 채점 무관
  userId?: string;                // 비로그인 허용(F-20)
  deviceFingerprint?: string;     // 비로그인 재개 보조(F-04)
}
export interface CreateSessionResponse {
  sessionId: string;
  resumeToken: string;            // 추측 불가 이어하기 링크
  questionSetVersion: number;
  product: Product;
  total: number;                  // 상품 문항 수 (32/72/144)
}

/** GET /api/sessions/:token — 이어하기 상태 조회. */
export interface ResumeStateResponse {
  sessionId: string;
  product: Product;
  avatarVersion: AvatarVersion;
  answered: number;
  total: number;
  nextQuestionId: string | null;  // null=전항 응답 완료
  status: SessionStatus;
}

/** PUT /api/sessions/:id/responses — 문항 응답 저장(멱등, 단건/배치 겸용). */
export interface SaveResponsesRequest {
  answers: AnswerInput[];         // 1개=단건, N개=배치. (sessionId,questionId) upsert
}
export interface SaveResponsesResponse {
  ok: true;
  saved: number;                  // 반영된 응답 수
  answered: number;               // 누적 응답 수
  total: number;
}

/** POST /api/sessions/:id/upgrade — 이어하기 승급(basic/standard→상위). 기존 응답 재사용·잔여만. */
export interface UpgradeSessionRequest {
  toProduct: Product;             // 상위 상품(현재보다 상위여야 함)
}
export interface UpgradeSessionResponse {
  sessionId: string;              // 승급 세션(신규 or 확장) id
  resumeToken: string;
  product: Product;
  reusedCount: number;            // 재사용된 기존 응답 수
  remaining: number;              // 추가 응답해야 할 잔여 문항 수
  nextQuestionId: string | null;
}

/** POST /api/sessions/:id/submit — 채점 실행. */
export interface SubmitResponse {
  result: Result;                 // 채점 결과(추측 불가 resultToken 포함)
  redirectUrl: string;            // 결과 티저 경로
}

/** GET /api/results/:resultToken — 결과 조회(추측 불가 토큰). Result + 렌더 콘텐츠. */
export interface ResultViewResponse {
  result: Result;
  content: ReportContentBlock[];  // minProduct ≤ result.product 인 블록만 서버 필터
  assets: CharacterAsset[];       // typeCode×gender (card/og/avatar)
  sections: SectionVisibility;    // 부록 D 노출 결정(서버 계산, 프론트 임의해석 금지)
}

/** GET /api/questions?version=&product= — 상품별 문항 세트. */
export interface QuestionsQuery {
  version?: number;               // 미지정=현행 question_set_version
  product: Product;
}
export interface QuestionsResponse {
  questionSetVersion: number;
  product: Product;
  total: number;
  questions: PublicQuestion[];    // 상품 product_tags 필터 적용
}

/** GET /api/assets?type=&gender= — 캐릭터 에셋(§6.4). */
export interface AssetsQuery {
  type?: TypeCode | 'VERSION';
  gender?: AvatarVersion;
  variant?: AssetVariant;
}
export type AssetsResponse = CharacterAsset[];

/* ── CMS (관리자) ── */
/** GET/PUT /api/admin/questions — 문항 매핑표 CRUD(product_tags·facet 포함). */
export interface AdminQuestion extends Question {
  poleA: Pole;                    // 'L' 고정
  poleB: Pole;                    // 'R' 고정
  facet: FacetKey | null;
  facetPoleA: Pole | null;
  facetPoleB: Pole | null;
  productTags: Product[];         // basic⊂standard⊂pro
  isActive: boolean;
}
export interface AdminQuestionUpsertRequest { question: AdminQuestion; }
export interface AdminQuestionsListResponse {
  questionSetVersion: number;
  questions: AdminQuestion[];
  balance: MappingBalanceReport;  // 지표별 문항수·극 균형 검증 결과(§4.4)
}
export interface MappingBalanceReport {
  perProduct: Record<Product, { total: number; perDimension: Record<Dimension, number> }>;
  poleBalanceOk: boolean;
  formatMixOk: boolean;
  unmappedFacetCount: number;     // facet=null 문항 수(오픈이슈 O-FACET 추적)
  warnings: string[];
}

/** GET/PUT /api/admin/report-content — 16유형×블록 CRUD. */
export interface AdminReportContentUpsertRequest { block: ReportContentBlock; }
export type AdminReportContentListResponse = ReportContentBlock[];

/** GET/PUT /api/admin/assets — 캐릭터 34종·파생형(F-32). */
export interface AdminAssetUpsertRequest { asset: CharacterAsset; }
export interface AdminAssetsListResponse {
  assets: CharacterAsset[];
  namingViolations: string[];     // '{TYPE}_{M|F}' 규칙 위반 파일(§6.4 검사)
  missing: string[];              // 34종 중 누락
}

/* ── 인증/계정 (F-20~23) ── */
export type AuthProvider = 'kakao' | 'google' | 'email';
export interface LoginRequest {
  provider: AuthProvider;
  token?: string;                 // 소셜 OAuth 토큰
  email?: string;                 // email 로그인
  linkSessionId?: string;         // 비로그인 검사 세션을 계정에 귀속
}
export interface LoginResponse {
  userId: string;
  accessToken: string;
  linkedSessionIds: string[];
}
export interface ConsentRequest {
  purpose: 'service_required' | 'marketing';
  granted: boolean;
  sessionId?: string;
  userId?: string;
  version: number;
}
export interface ConsentResponse { ok: true; }
/** DELETE /api/me/data — 계정·응답·결과 완전 삭제(F-23). */
export interface DeleteMyDataResponse { ok: true; deletionRequestId: string; }

/* ══════════════════════════════════════════════════════════
 * 5. 채점 엔진 경계 (순수 함수 시그니처) — scoring-engineer 소유
 * ══════════════════════════════════════════════════════════ */

/** 채점 순수함수 입력 문항(매핑표 극·facet 포함). DB/HTTP 의존 없음. */
export interface ScoringQuestion {
  questionId: string;
  dimension: Dimension;
  poleA: Pole;                    // 'L'
  poleB: Pole;                    // 'R'
  facet: FacetKey | null;
  facetPoleA: Pole | null;
  facetPoleB: Pole | null;
}
export interface ScoringAnswer { questionId: string; choice: Choice; }

export interface ScoringInput {
  product: Product;
  questions: ScoringQuestion[];   // 상품 세트로 이미 필터됨
  answers: ScoringAnswer[];
}

/** 채점 산출(영속화 전 순수 객체). resultToken/reportVersion 등 IO 필드는 backend가 부여. */
export interface ScoringOutput {
  typeCode: TypeCode;
  scores: DimensionScores;
  clarity: Clarity;               // 상품 스케일(8/18/30)로 산출
  functionStack: FunctionStack;
  facets: Facets | null;          // pro만
  clarityIndex: number | null;    // pro
  omittedCount: number;
  tieBreakApplied: Dimension[];
}

/** 채점 순수함수 시그니처(계약). 구현은 packages/scoring. */
export type ScoreFn = (input: ScoringInput) => ScoringOutput;

/* ══════════════════════════════════════════════════════════
 * 6. 상품 차등 상수 (부록 D · 표준양식 TIERS) — 계약으로 성문화
 *    프론트는 이 상수만 참조(임의 해석 금지).
 * ══════════════════════════════════════════════════════════ */

/** 상품별 분명도 스케일(표준양식 TIERS). */
export const TIER_SCALE: Record<Product, { max: number; step: number; clarityAdvisory: boolean }> = {
  basic:    { max: 8,  step: 2, clarityAdvisory: true  }, // 참고용(§4.5 ①)
  standard: { max: 18, step: 3, clarityAdvisory: false },
  pro:      { max: 30, step: 5, clarityAdvisory: false },
};

/** 상품별 문항 수. */
export const PRODUCT_ITEM_COUNT: Record<Product, { total: number; perDimension: number }> = {
  basic:    { total: 32,  perDimension: 8  },
  standard: { total: 72,  perDimension: 18 },
  pro:      { total: 144, perDimension: 36 },
};

/** 상품 포함 순서(승급 가능 방향: 낮은→높은). */
export const PRODUCT_ORDER: Product[] = ['basic', 'standard', 'pro'];

export type SectionAvail = 'full' | 'partial' | 'none'; // ● / ◐ / —

/** 부록 D 섹션 노출 매트릭스. 미제공(none)은 숨기지 말고 "상위 검사에서 제공" 노출. */
export const SECTION_MATRIX: Record<string, Record<Product, SectionAvail>> = {
  cover:              { basic: 'full', standard: 'full', pro: 'full' }, // 표지·검사구성
  sec1_before:        { basic: 'none', standard: 'full', pro: 'full' }, // Ⅰ 4지표 이해
  sec2_clarity:       { basic: 'partial', standard: 'full', pro: 'full' }, // Ⅱ 분명도(basic 참고용)
  sec3_profile_badge: { basic: 'full', standard: 'full', pro: 'full' }, // Ⅲ 배지·별칭·키워드
  sec3_narrative:     { basic: 'none', standard: 'full', pro: 'full' }, // Ⅲ 종합해설·특성4종
  sec4_stack:         { basic: 'none', standard: 'partial', pro: 'full' }, // Ⅳ 위계(std=위계만)
  sec4_dynamics:      { basic: 'none', standard: 'none', pro: 'full' }, // Ⅳ 상호작용·스트레스
  sec5_facets:        { basic: 'none', standard: 'none', pro: 'full' }, // Ⅴ 다면척도 20
  summary_clarity:    { basic: 'none', standard: 'full', pro: 'full' }, // 결과요약 분명도
  summary_facets:     { basic: 'none', standard: 'none', pro: 'full' }, // 결과요약 종합·소견
};

/** 업그레이드 배너 노출: 어떤 상품이 어떤 상위 상품을 안내하는가. */
export const UPGRADE_BANNER: Record<Product, Product[]> = {
  basic:    ['standard', 'pro'],
  standard: ['pro'],
  pro:      [],
};

/** 프론트가 소비할 노출 결정 페이로드(서버 계산 후 결과 응답에 동봉). */
export interface SectionVisibility {
  product: Product;
  scale: { max: number; step: number; clarityAdvisory: boolean };
  sections: Record<string, SectionAvail>;
  upgradeTargets: Product[];
}

/** 심리기능 위계 상수(§5.3, 16유형). 채점 엔진 내장·계약 노출. */
export const FUNCTION_STACK: Record<TypeCode, FunctionStack> = {
  ISTJ: { dominant:'Si', auxiliary:'Te', tertiary:'Fi', inferior:'Ne' },
  ISFJ: { dominant:'Si', auxiliary:'Fe', tertiary:'Ti', inferior:'Ne' },
  INFJ: { dominant:'Ni', auxiliary:'Fe', tertiary:'Ti', inferior:'Se' },
  INTJ: { dominant:'Ni', auxiliary:'Te', tertiary:'Fi', inferior:'Se' },
  ISTP: { dominant:'Ti', auxiliary:'Se', tertiary:'Ni', inferior:'Fe' },
  ISFP: { dominant:'Fi', auxiliary:'Se', tertiary:'Ni', inferior:'Te' },
  INFP: { dominant:'Fi', auxiliary:'Ne', tertiary:'Si', inferior:'Te' },
  INTP: { dominant:'Ti', auxiliary:'Ne', tertiary:'Si', inferior:'Fe' },
  ESTP: { dominant:'Se', auxiliary:'Ti', tertiary:'Fe', inferior:'Ni' },
  ESFP: { dominant:'Se', auxiliary:'Fi', tertiary:'Te', inferior:'Ni' },
  ENFP: { dominant:'Ne', auxiliary:'Fi', tertiary:'Te', inferior:'Si' },
  ENTP: { dominant:'Ne', auxiliary:'Ti', tertiary:'Fe', inferior:'Si' },
  ESTJ: { dominant:'Te', auxiliary:'Si', tertiary:'Ne', inferior:'Fi' },
  ESFJ: { dominant:'Fe', auxiliary:'Si', tertiary:'Ne', inferior:'Ti' },
  ENFJ: { dominant:'Fe', auxiliary:'Ni', tertiary:'Se', inferior:'Ti' },
  ENTJ: { dominant:'Te', auxiliary:'Ni', tertiary:'Se', inferior:'Fi' },
};

/** 동점 규칙: 동점 시 판정 극(§5.1). I,N,F,P = 'R'. */
export const TIE_BREAK_POLE: Record<Dimension, Pole> = { EI:'R', SN:'R', TF:'R', JP:'R' };

/** 선호 명확도 밴드 경계(다수극 응답 비율 %, §5.2). */
export const CLARITY_BANDS: { band: ClarityBand; minPercent: number }[] = [
  { band: 'very_clear', minPercent: 76 },
  { band: 'clear',      minPercent: 66 },
  { band: 'moderate',   minPercent: 56 },
  { band: 'slight',     minPercent: 50 },
];

/* ══════════════════════════════════════════════════════════
 * 7. 표준양식 DATA{} 어댑터 타입 (frontend toReportData 대상)
 * ══════════════════════════════════════════════════════════ */
export interface ReportData {
  tier: Product;
  clarity: Record<Dimension, { pole: Pole; score: number } | null>;
  myType: TypeCode | null;
  facets: Record<FacetKey, { side: Pole; score: number } | null>; // pro만 값, 그 외 null
}
