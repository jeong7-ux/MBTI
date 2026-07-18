-- ============================================================================
-- 마인드타입 (MindType) — Supabase / PostgreSQL 테이블 생성 스크립트
-- ----------------------------------------------------------------------------
-- 생성원: prisma/schema.prisma (SSOT) → `prisma migrate diff`로 자동 추출.
--         스키마와 100% 일치하며, 손으로 수정하지 말 것(스키마 변경 시 재생성).
-- 재생성: npx prisma migrate diff --from-empty \
--           --to-schema-datamodel prisma/schema.prisma --script
-- ----------------------------------------------------------------------------
-- 사용법(Supabase):
--   1) Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여넣기 → Run
--   2) 또는 psql "$DATABASE_URL" -f supabase/schema.sql
-- 구성: enum 10종 → table 13종 → index 21종 → foreign key.
-- 주의: public 스키마에 생성됩니다. RLS 정책은 supabase/README.md 참조.
-- ============================================================================

BEGIN;

-- CreateEnum
CREATE TYPE "Dimension" AS ENUM ('EI', 'SN', 'TF', 'JP');

-- CreateEnum
CREATE TYPE "Pole" AS ENUM ('L', 'R');

-- CreateEnum
CREATE TYPE "Choice" AS ENUM ('A', 'B');

-- CreateEnum
CREATE TYPE "Format" AS ENUM ('sentence', 'word_pair');

-- CreateEnum
CREATE TYPE "Product" AS ENUM ('basic', 'standard', 'pro');

-- CreateEnum
CREATE TYPE "AvatarVersion" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "AssetVariant" AS ENUM ('card', 'avatar', 'og');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('kakao', 'google', 'email');

-- CreateEnum
CREATE TYPE "ConsentPurpose" AS ENUM ('service_required', 'marketing');

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "part" INTEGER NOT NULL,
    "format" "Format" NOT NULL,
    "dimension" "Dimension" NOT NULL,
    "poleA" "Pole" NOT NULL,
    "poleB" "Pole" NOT NULL,
    "textA" TEXT NOT NULL,
    "textB" TEXT NOT NULL,
    "stem" TEXT,
    "facet" TEXT,
    "facetPoleA" "Pole",
    "facetPoleB" "Pole",
    "productTags" "Product"[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "questionSetVersion" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "resumeToken" TEXT NOT NULL,
    "resultToken" TEXT,
    "product" "Product" NOT NULL,
    "avatarVersion" "AvatarVersion" NOT NULL,
    "questionSetVersion" INTEGER NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'in_progress',
    "upgradedFromSessionId" TEXT,
    "deviceFingerprint" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "TestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choice" "Choice" NOT NULL,
    "elapsedMs" INTEGER,
    "revisedCount" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "typeCode" TEXT NOT NULL,
    "product" "Product" NOT NULL,
    "scores" JSONB NOT NULL,
    "clarity" JSONB NOT NULL,
    "functionStack" JSONB NOT NULL,
    "facets" JSONB,
    "clarityIndex" INTEGER,
    "omittedCount" INTEGER NOT NULL DEFAULT 0,
    "tieBreakApplied" JSONB,
    "reportVersion" INTEGER NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportContent" (
    "id" TEXT NOT NULL,
    "typeCode" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "facetKey" TEXT,
    "body" JSONB NOT NULL,
    "minProduct" "Product" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAsset" (
    "id" TEXT NOT NULL,
    "typeCode" TEXT NOT NULL,
    "gender" "AvatarVersion" NOT NULL,
    "variant" "AssetVariant" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "temperament" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CharacterAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "birthYear" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProviderType" NOT NULL,
    "providerUid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "purpose" "ConsentPurpose" NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "version" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDeletionRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "DataDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "actorId" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seatLimit" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "sessionId" TEXT,
    "userId" TEXT,
    "consentShared" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_questionSetVersion_dimension_idx" ON "Question"("questionSetVersion", "dimension");

-- CreateIndex
CREATE INDEX "Question_questionSetVersion_isActive_idx" ON "Question"("questionSetVersion", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TestSession_resumeToken_key" ON "TestSession"("resumeToken");

-- CreateIndex
CREATE UNIQUE INDEX "TestSession_resultToken_key" ON "TestSession"("resultToken");

-- CreateIndex
CREATE INDEX "TestSession_userId_idx" ON "TestSession"("userId");

-- CreateIndex
CREATE INDEX "TestSession_status_idx" ON "TestSession"("status");

-- CreateIndex
CREATE INDEX "Response_sessionId_idx" ON "Response"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_sessionId_questionId_key" ON "Response"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_sessionId_key" ON "Result"("sessionId");

-- CreateIndex
CREATE INDEX "ReportContent_typeCode_status_idx" ON "ReportContent"("typeCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReportContent_typeCode_blockKey_facetKey_version_key" ON "ReportContent"("typeCode", "blockKey", "facetKey", "version");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAsset_typeCode_gender_variant_version_key" ON "CharacterAsset"("typeCode", "gender", "variant", "version");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerUid_key" ON "AuthIdentity"("provider", "providerUid");

-- CreateIndex
CREATE INDEX "ConsentRecord_userId_idx" ON "ConsentRecord"("userId");

-- CreateIndex
CREATE INDEX "ConsentRecord_sessionId_idx" ON "ConsentRecord"("sessionId");

-- CreateIndex
CREATE INDEX "AccessLog_targetType_targetId_idx" ON "AccessLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AccessLog_createdAt_idx" ON "AccessLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Group_inviteCode_key" ON "Group"("inviteCode");

-- CreateIndex
CREATE INDEX "GroupMember_groupId_idx" ON "GroupMember"("groupId");

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSession" ADD CONSTRAINT "TestSession_upgradedFromSessionId_fkey" FOREIGN KEY ("upgradedFromSessionId") REFERENCES "TestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataDeletionRequest" ADD CONSTRAINT "DataDeletionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;


COMMIT;

-- 검증: 13개 테이블이 생성됐는지 확인
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
