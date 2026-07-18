/**
 * 매핑표 균형 검증 (§4.4 · 매핑 R-1~R-2) — scoring/qa 공용.
 * 실행: npx tsx scripts/validate-mapping.ts [경로]
 * 기본 대상: _workspace/01_architect_mapping_sample.json (대표 24문항).
 * 검사: ① 상품 세트 지표별 문항 수 균형 ② 극 규약(A=L,B=R) ③ product_tags 포함관계(basic⊂standard⊂pro)
 *       ④ facet 커버리지(pro 20종) ⑤ 형식 혼합. 위반 시 exit 1.
 *
 * 주의: 샘플은 대표 24문항이라 상품별 절대 문항 수(8/18/36)에는 미달한다 —
 *       비율/규약/포함관계/커버리지의 '규칙 정합'만 강제하고, 절대 수량은 경고로 보고한다.
 *       144문항 실데이터는 CMS 시드 후 동일 스크립트로 절대 수량까지 검증한다(오픈이슈 R1).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PRODUCT_ORDER } from '../lib/contract';
import type { Dimension, FacetKey, Pole, Product } from '../lib/contract';

interface RawQuestion {
  question_id: string;
  code: string;
  format: 'sentence' | 'word_pair';
  dimension: Dimension;
  pole_a: Pole;
  pole_b: Pole;
  facet: FacetKey | null;
  facet_pole_a: Pole | null;
  facet_pole_b: Pole | null;
  product_tags: Product[];
  is_active: boolean;
}

const DIMENSIONS: Dimension[] = ['EI', 'SN', 'TF', 'JP'];
const FACET_KEYS: FacetKey[] = [
  'EI1', 'EI2', 'EI3', 'EI4', 'EI5', 'SN1', 'SN2', 'SN3', 'SN4', 'SN5',
  'TF1', 'TF2', 'TF3', 'TF4', 'TF5', 'JP1', 'JP2', 'JP3', 'JP4', 'JP5',
];

const errors: string[] = [];
const warnings: string[] = [];

function main(): void {
  const path = resolve(
    process.argv[2] ?? '_workspace/01_architect_mapping_sample.json',
  );
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as { questions: RawQuestion[] };
  const questions = raw.questions.filter((q) => q.is_active);

  // ② 극 규약: pole_a 항상 L, pole_b 항상 R
  for (const q of questions) {
    if (q.pole_a !== 'L' || q.pole_b !== 'R') {
      errors.push(`[극규약] ${q.code}: pole_a=${q.pole_a} pole_b=${q.pole_b} (A=L,B=R 위반)`);
    }
    if (q.facet && (!q.facet_pole_a || !q.facet_pole_b)) {
      errors.push(`[facet] ${q.code}: facet=${q.facet}인데 facet_pole 누락`);
    }
  }

  // ③ product_tags 포함관계: basic⊂standard⊂pro
  for (const q of questions) {
    const t = new Set(q.product_tags);
    if (t.has('basic') && !(t.has('standard') && t.has('pro'))) {
      errors.push(`[포함관계] ${q.code}: basic 태그인데 standard/pro 누락(basic⊂standard⊂pro 위반)`);
    }
    if (t.has('standard') && !t.has('pro')) {
      errors.push(`[포함관계] ${q.code}: standard 태그인데 pro 누락`);
    }
  }

  // ① 상품 세트 지표별 균형 + ⑤ 형식 혼합
  for (const product of PRODUCT_ORDER) {
    const set = questions.filter((q) => q.product_tags.includes(product));
    const perDim: Record<Dimension, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };
    let sentence = 0;
    let wordPair = 0;
    for (const q of set) {
      perDim[q.dimension] += 1;
      if (q.format === 'sentence') sentence += 1;
      else wordPair += 1;
    }
    const counts = DIMENSIONS.map((d) => perDim[d]);
    const balanced = counts.every((c) => c === counts[0]);
    if (!balanced) {
      warnings.push(
        `[균형/${product}] 지표별 문항 수 불균형 EI=${perDim.EI} SN=${perDim.SN} TF=${perDim.TF} JP=${perDim.JP} (대표샘플 허용, 실데이터 강제)`,
      );
    }
    if (set.length > 0 && (sentence === 0 || wordPair === 0)) {
      warnings.push(`[형식/${product}] 형식 혼합 부족 sentence=${sentence} word_pair=${wordPair}`);
    }
  }

  // ④ facet 커버리지: pro 세트가 20 facet 전부 커버
  const proSet = questions.filter((q) => q.product_tags.includes('pro'));
  const covered = new Set(proSet.map((q) => q.facet).filter(Boolean));
  const missing = FACET_KEYS.filter((k) => !covered.has(k));
  if (missing.length > 0) {
    errors.push(`[facet커버리지] pro 세트 미커버 facet: ${missing.join(', ')}`);
  }

  // 보고
  console.log(`검증 대상: ${path}`);
  console.log(`활성 문항: ${questions.length}`);
  console.log(
    `상품 세트: ${PRODUCT_ORDER.map((p) => `${p}=${questions.filter((q) => q.product_tags.includes(p)).length}`).join(' · ')}`,
  );
  console.log(`facet 커버리지: ${20 - missing.length}/20`);
  if (warnings.length) {
    console.log('\n경고(대표샘플 허용):');
    warnings.forEach((w) => console.log('  ⚠ ' + w));
  }
  if (errors.length) {
    console.log('\n오류(규칙 위반):');
    errors.forEach((e) => console.log('  ✗ ' + e));
    console.log(`\n검증 실패: ${errors.length}건`);
    process.exit(1);
  }
  console.log('\n검증 통과 ✓ (규칙 정합 OK · 절대 수량은 실데이터 시 강제)');
}

main();
