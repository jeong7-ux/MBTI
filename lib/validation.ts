// 요청 zod 스키마 — 계약 요청 타입과 1:1. 파싱 실패 시 VALIDATION_ERROR.
import { z } from 'zod';

export const productSchema = z.enum(['basic', 'standard', 'pro']);
export const avatarSchema = z.enum(['M', 'F']);
export const choiceSchema = z.enum(['A', 'B']);

// POST /api/sessions — CreateSessionRequest
export const createSessionSchema = z.object({
  product: productSchema,
  avatarVersion: avatarSchema,
  userId: z.string().optional(),
  deviceFingerprint: z.string().optional(),
});

// PUT /api/sessions/:id/responses — SaveResponsesRequest
export const answerInputSchema = z.object({
  questionId: z.string().min(1),
  choice: choiceSchema,
  elapsedMs: z.number().int().nonnegative().optional(),
  revisedCount: z.number().int().nonnegative().optional(),
});
export const saveResponsesSchema = z.object({
  answers: z.array(answerInputSchema).min(1),
});

// POST /api/sessions/:id/upgrade — UpgradeSessionRequest
export const upgradeSchema = z.object({ toProduct: productSchema });

// POST /api/auth/login — LoginRequest
export const loginSchema = z.object({
  provider: z.enum(['kakao', 'google', 'email']),
  token: z.string().optional(),
  email: z.string().email().optional(),
  linkSessionId: z.string().optional(),
});

// POST /api/consent — ConsentRequest
export const consentSchema = z.object({
  purpose: z.enum(['service_required', 'marketing']),
  granted: z.boolean(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  version: z.number().int(),
});

// CMS
const poleSchema = z.enum(['L', 'R']);
export const adminQuestionSchema = z.object({
  question: z.object({
    questionId: z.string(),
    code: z.string(),
    part: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    format: z.enum(['sentence', 'word_pair']),
    dimension: z.enum(['EI', 'SN', 'TF', 'JP']),
    stem: z.string().nullable(),
    textA: z.string(),
    textB: z.string(),
    version: z.number().int(),
    questionSetVersion: z.number().int(),
    poleA: poleSchema,
    poleB: poleSchema,
    facet: z.string().nullable(),
    facetPoleA: poleSchema.nullable(),
    facetPoleB: poleSchema.nullable(),
    productTags: z.array(productSchema),
    isActive: z.boolean(),
  }),
});

export const adminContentSchema = z.object({
  block: z.object({
    typeCode: z.string(),
    blockKey: z.string(),
    facetKey: z.string().nullable(),
    body: z.unknown(),
    minProduct: productSchema,
    version: z.number().int(),
  }),
});

// ── 관리자 패널(하드코딩 운영 계정 — 계약 lib/contract 외 전용 스키마) ──────
// POST /api/admin/login
export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/admin/reset — 파괴적 작업 서버측 2차 가드.
export const adminResetSchema = z.object({
  confirm: z.literal('DELETE_ALL'),
});

export const adminAssetSchema = z.object({
  asset: z.object({
    typeCode: z.string(),
    gender: avatarSchema,
    variant: z.enum(['card', 'avatar', 'og']),
    fileUrl: z.string(),
    fileName: z.string(),
    altText: z.string(),
    temperament: z.enum(['NT', 'NF', 'SJ', 'SP']),
    version: z.number().int(),
  }),
});
