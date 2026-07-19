# 배포 가이드 — 마인드타입 (GitHub → Netlify)

Next.js 14 (App Router) + Prisma + Supabase(PostgreSQL) 서비스를 GitHub 리포에 올리고 Netlify에 퍼블리싱한다.

## 배포 범위
- **포함(서비스 코드)**: `app/` `components/` `lib/` `packages/` `prisma/`(+`seed-data.json`) `scripts/` `public/`(캐릭터·버전 SVG) `supabase/` + 빌드 설정(`package.json` `tsconfig` `next.config` `tailwind` `postcss` `netlify.toml`) + `README`/`DEPLOYMENT`.
- **제외(`.gitignore`)**: `.claude/`(스킬·에이전트) `_workspace/`(설계·QA 문서) `kordoc/` `taste-skill/` `CLAUDE.md` PRD(`.docx`/`.md`) 표준양식 HTML · **`.env`(시크릿)** · `node_modules` · **라나/코난 PNG(저작권)**.

---

## Step 1 — GitHub 업로드
```bash
git init                      # (이미 초기화됨)
git add -A
git commit -m "feat: 마인드타입 MVP 초기 배포본"
git branch -M main
git remote add origin https://github.com/jeong7-ux/MBTI.git
git push -u origin main
```
> 인증: HTTPS는 GitHub PAT(토큰) 또는 `gh auth login`. 리포가 비어있지 않으면 `git pull --rebase origin main` 후 push.

## Step 2 — Netlify 연결
1. Netlify → **Add new site → Import an existing project → GitHub → `jeong7-ux/MBTI`**.
2. 빌드 설정은 `netlify.toml`이 자동 적용(빌드 `npm run build`, 퍼블리시 `.next`, 공식 `@netlify/plugin-nextjs`). 수동 입력 불필요.
3. Node 20(이미 toml에 지정).

## Step 3 — 환경변수 (Netlify → Site settings → Environment variables)
| 키 | 값 | 비고 |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.udgnzyqovpbvvfggskkx:<PW>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` | **런타임은 Transaction pooler(6543)+pgbouncer** — 서버리스 필수 |

> `NEXT_PUBLIC_USE_MOCK`은 설정 불필요 — **기본이 실 API**다(미설정 = 실 연결). 목 모드는 `true`로 명시했을 때만 켜지며 전 화면에 "목 모드" 배지가 표시된다. (과거 기본목 정책으로 env 누락 시 배포 사이트가 예시 문항을 노출한 사고의 재발 방지.)
> ⚠️ 비밀번호의 `!`,`@`는 URL 인코딩(`%21`,`%40`). `.env`는 배포되지 않으므로 값은 Netlify 대시보드에만 입력한다.
> ⚠️ `NEXT_PUBLIC_*`는 빌드 시점에 번들에 포함되므로, 환경변수 변경 후에는 **Clear cache and deploy site**로 재빌드해야 반영된다.

## Step 4 — DB 마이그레이션·시드 (로컬에서 Supabase 대상, 1회)
Netlify 빌드는 마이그레이션하지 않는다. 스키마·시드는 로컬에서 **Session pooler(5432)** 로 반영한다(이미 완료된 상태라면 생략):
```bash
# 로컬 .env DATABASE_URL = ...pooler.supabase.com:5432/postgres (session, pgbouncer 없이)
npx prisma db push        # 스키마 반영 (또는 supabase/schema.sql)
npm run db:seed           # 대표 문항 24종 (prisma/seed-data.json)
```
- 표준 검사(basic32/standard72/pro144)를 실제로 완주 채점하려면 **문항 실데이터(144)** 를 CMS(F-30) 또는 시드로 채워야 한다(현재는 대표 샘플/개발용 합성분). 이는 오픈이슈 **R1**(문항 저작권).

---

## Prisma × 서버리스 핵심
- `schema.prisma`의 `binaryTargets = ["native","rhel-openssl-3.0.x"]` — Netlify Functions(AWS Lambda) 런타임 엔진. **누락 시 런타임 500**.
- `postinstall: prisma generate` — Netlify 설치 단계에서 Client 생성.
- 런타임은 **Transaction pooler(6543)** + `connection_limit=1` — 함수 인스턴스 폭증 시 커넥션 고갈 방지. 마이그레이션은 pooler 트랜잭션 모드에서 불가하므로 **로컬 Session pooler(5432)** 로 수행.

## 배포 후 점검
- `/` `/select` `/version` `/library` 200 · `/result/<token>` 실데이터 렌더.
- `POST /api/sessions` 등 API가 Netlify Function으로 200.
- 캐릭터 SVG(`/characters/*.svg`)·버전 카드 로드.

## 남은 이슈 (배포 전/후 판단)
- **버전 카드**: 라나/코난(저작권)은 제거하고 **원본 SVG(대표 캐릭터)** 로 대체함. 정식 출시 전 §6.4 전용 버전 카드 아트(480×620)로 격상 권장.
- **리포트 콘텐츠(별칭·해설·키워드)·캐릭터 34종 CMS 시딩** 시 결과 리포트가 완성 문구로 채워짐(현재는 "해설 준비 중" 우아한 대체).
- 인증/결제/OG-PNG는 스텁 → 인프라·시크릿 결정 후 실구현.

## 롤백
Netlify는 배포 단위 롤백 지원(Deploys → 이전 성공 배포 → Publish). 코드 롤백은 `git revert`.
