# Supabase 셋업 — 마인드타입

Prisma 스키마(`prisma/schema.prisma`, SSOT)에서 자동 추출한 테이블 생성 스크립트로 Supabase(호스티드 PostgreSQL)에 스키마를 올린다.

| 파일 | 내용 |
|---|---|
| `schema.sql` | enum 10 · 테이블 13 · 인덱스 21 · FK 생성 (스키마와 100% 일치) |
| `seed.sql` | 대표 문항 24종 시드 (UPSERT, 재실행 안전) |

---

## 방법 A — Supabase SQL Editor (가장 간단)

1. Supabase 프로젝트 → **SQL Editor** → **New query**
2. `schema.sql` 전체를 붙여넣고 **Run** → 테이블 13종 생성
3. `seed.sql` 전체를 붙여넣고 **Run** → 문항 24종 삽입
4. 확인:
   ```sql
   select table_name from information_schema.tables where table_schema='public' order by 1;
   select dimension, count(*) from "Question" group by dimension order by 1;
   ```

## 방법 B — psql CLI

```bash
# Supabase → Project Settings → Database → Connection string (URI) 복사
export DATABASE_URL="postgresql://postgres:[PW]@db.[REF].supabase.co:5432/postgres"
psql "$DATABASE_URL" -f supabase/schema.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

## 방법 C — Prisma (권장: 이후 스키마 변경까지 관리)

```bash
export DATABASE_URL="postgresql://postgres:[PW]@db.[REF].supabase.co:5432/postgres"
npx prisma db push        # schema.prisma → Supabase (마이그레이션 이력 없이 반영)
npm run db:seed           # prisma/seed.ts (schema.sql/seed.sql 대신 사용 가능)
```
> 스키마를 바꾸면 `schema.sql`은 아래로 재생성한다(손 편집 금지):
> ```bash
> npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > supabase/schema.sql
> ```

---

## 앱 연결

`.env`:
```
# 앱 런타임(서버). 트래픽 스파이크 대응은 pooler(6543) 권장.
DATABASE_URL="postgresql://postgres:[PW]@db.[REF].supabase.co:5432/postgres"
# 프론트를 실 API에 연결
NEXT_PUBLIC_USE_MOCK="false"
```
```bash
npm run dev   # 이제 세션 생성·응답 저장·실채점·결과 조회가 end-to-end로 동작
```

### 연결 문자열 두 종류
- **Direct (5432)**: 마이그레이션·시드·`prisma db push`용.
- **Pooler / Transaction (6543)**: 서버리스(Vercel) 런타임 권장. Prisma 사용 시 URL 끝에 `?pgbouncer=true` 추가.

---

## 보안 (RLS) — 중요

이 앱은 **서버 사이드에서만 DB에 접근**한다(Next.js route handler + Prisma, service 연결). Supabase의 anon 공개 키로 클라이언트가 테이블에 직접 접근하지 않는다. 따라서:

- 클라이언트가 anon 키로 REST/Realtime에 접근할 수 있는 환경이라면, 심리검사 응답·결과는 민감정보(PRD §10)이므로 **모든 테이블에 RLS를 활성화**하고 공개 정책을 두지 않는다:
  ```sql
  alter table "Response" enable row level security;
  alter table "Result"   enable row level security;
  alter table "TestSession" enable row level security;
  -- (정책 미정의 시 anon 접근 차단됨. 서버는 service_role 키로 우회.)
  ```
- 결과 URL은 추측 불가 토큰(`Result.resultToken`)으로만 열람하며(§10), service_role 키는 서버에만 둔다(절대 클라이언트 노출 금지).

> 상세 데이터 모델·결정 근거: `_workspace/01_architect_datamodel.md`. 오픈이슈(문항 저작권 R1, facet 실매핑 O-FACET): `_workspace/01_architect_open_issues.md`.
