# 마인드타입 (MindType)

전문 검사 시행 절차(오리엔테이션 → 문항 → 심층 해석)를 디지털로 옮긴 성격유형 검사 웹 서비스. **P0/MVP 구현본.**

- 제품 명세: `마인드타입_PRD_v1.2.md` (SSOT 추출본) / `.docx` (발주자 원본)
- 결과보고서 출력 명세: `MBTI_결과보고서_표준양식_v2.html` (FORM v2.0, 상품 tier 차등)

## 기술 스택
Next.js 14 (App Router) · TypeScript(strict) · Prisma + PostgreSQL · Redis(캐시, ADR-6) · Tailwind · Vitest

## 프로젝트 구조
```
lib/contract/        API 계약 SSOT — 전 모듈 import 소스 (타입·상수)
packages/scoring/    순수 채점 엔진 + 골든 테스트 (DB/HTTP 무의존)
prisma/              schema.prisma (13 모델) + seed.ts
app/api/             백엔드 API 라우트 15종 (세션·응답·승급·submit·결과·인증·동의·CMS)
app/(routes)/        검사 플로우·결과 리포트 화면 12종
components/          UI 컴포넌트 14종 (report/* = 표준양식 React 포팅)
lib/report/          Result → 표준양식 DATA{} 어댑터 (toReportData)
scripts/             validate-mapping.ts (문항 균형 검증)
_workspace/          빌드 산출물·설계 문서·QA/감사 리포트 (감사 추적 보존)
```

## 실행
```bash
npm install
npm run test:scoring     # 채점 골든 테스트 (65케이스, DB 불필요)
npm run validate:mapping # 문항-지표-facet 매핑 균형 검증
npm run typecheck        # tsc --noEmit
npm run build            # next build

# 실 API·DB 기동 (선택)
cp .env.example .env      # DATABASE_URL 설정
npm run prisma:migrate
npm run db:seed          # 실 144문항 시드
npm run dev              # 기본 실 API 연결 (DATABASE_URL 필요)
```
프론트는 **기본 실 API**에 연결한다(미설정 = 실 연결). DB 없이 UI만 볼 때는 `NEXT_PUBLIC_USE_MOCK=true`로 목 모드를 명시적으로 켠다 — 활성 시 전 화면에 "목 모드" 배지가 표시된다(예시 데이터 오인 방지).

## 핵심 도메인 (PRD v1.2 / v1.1)
- **검사 상품 3종**: 간편(basic·32) / 일반(standard·72) / 전문(pro·144). 단일 문항은행·엔진 위 `product_tags`(basic⊂standard⊂pro) 균형 추출.
- **차등 결과보고서**: `Result.product`로 부록 D 섹션 노출·분명도 스케일(8/18/30)·다면척도 20종(pro 전용)이 자동 전환. 미제공 영역은 "상위 검사에서 제공" 노출.
- **이어하기 승급**: 포함관계 덕에 하위 응답 재사용 + 잔여 문항만 추가.
- **성별 버전·캐릭터**: avatar_version(M/F) 채점 무관, 캐릭터 34종·기질 4그룹 컬러.

## 검증 상태 (2026-07-18 마감)
| 검증 | 결과 |
|---|---|
| 채점 골든 테스트 | 65/65 ✅ |
| 문항 매핑 균형 검증 | 통과 (facet 20/20) ✅ |
| `tsc --noEmit` (통합) | 0 에러 ✅ |
| `next build` | 성공 (18 페이지 + API 15 라우트) ✅ |
| 3대 경계면 교차검증 (QA) | 전부 PASS, 런타임 크래시 0건 ✅ |
| 디자인 anti-slop 감사 | 통과 (접근성 AA 이슈 반영 완료) ✅ |

## 알려진 오픈이슈 (발주자 결정 필요 · 구현 비차단)
- **O-FACET**: 다면척도 20종 실매핑(문항→facet) 발주자 감수 — 산출식·shape 확정, 대표 샘플 검증 완료. 144문항 유입 시 재검증.
- **R1**: 144문항 저작권/사용권 확인(출시 게이트, 법무 트랙). 현재 대표 시드 24문항.
- **인증·암호화·PG**: 스텁 + TODO 지점 표시(인프라/시크릿 결정 후 실구현).
- **캐릭터 34종 실에셋**: 유형코드+기질색 플레이스홀더로 대체(원화 발주 시 교체).
- **O-KW / clarityIndex 산출식**: shape 고정, 데이터/공식만 교체 가능.

상세 설계·결정 근거·이슈는 `_workspace/01_architect_*` · `_workspace/05_qa_report.md` · `_workspace/05_designer_audit.md` 참조.
