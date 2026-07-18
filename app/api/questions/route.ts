// GET /api/questions?version=&product= — 상품별 문항 세트(product_tags 필터).
// 계약: QuestionsQuery → QuestionsResponse (lib/contract §4)
import { ok, ERR } from '@/lib/http';
import { loadQuestions, toPublicQuestion, currentSetVersion } from '@/lib/questions';
import { productSchema } from '@/lib/validation';
import type { QuestionsResponse } from '@contract';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const productParam = url.searchParams.get('product');
  const p = productSchema.safeParse(productParam);
  if (!p.success) return ERR.INVALID_PRODUCT({ product: productParam });

  const versionParam = url.searchParams.get('version');
  const version = versionParam ? Number(versionParam) : await currentSetVersion();
  if (Number.isNaN(version)) return ERR.VALIDATION({ version: versionParam });

  const rows = await loadQuestions(p.data, version);
  const body: QuestionsResponse = {
    questionSetVersion: version,
    product: p.data,
    total: rows.length,
    questions: rows.map(toPublicQuestion),
  };
  return ok(body);
}
