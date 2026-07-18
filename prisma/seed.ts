// 매핑표 시드 — 대표 샘플(24문항) 이관. 나머지 120문항은 CMS(F-30) 입력.
// SSOT: prisma/seed-data.json (리포 내 자립본, 극 규약 pole_a=L, pole_b=R).
// 실행: npm run db:seed (DB 연결 필요).
import { PrismaClient, Format, Dimension, Pole, Product } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

type SeedQuestion = {
  question_id: string; code: string; part: number; format: string; dimension: string;
  stem: string | null; text_a: string; text_b: string; pole_a: string; pole_b: string;
  facet: string | null; facet_pole_a: string | null; facet_pole_b: string | null;
  product_tags: string[]; version: number; question_set_version: number; is_active: boolean;
};

async function main() {
  const path = join(process.cwd(), 'prisma', 'seed-data.json');
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as { questions: SeedQuestion[] };

  for (const q of raw.questions) {
    await prisma.question.upsert({
      where: { id: q.question_id },
      update: {},
      create: {
        id: q.question_id,
        code: q.code,
        part: q.part,
        format: q.format as Format,
        dimension: q.dimension as Dimension,
        poleA: q.pole_a as Pole,
        poleB: q.pole_b as Pole,
        textA: q.text_a,
        textB: q.text_b,
        stem: q.stem,
        facet: q.facet,
        facetPoleA: q.facet_pole_a as Pole | null,
        facetPoleB: q.facet_pole_b as Pole | null,
        productTags: q.product_tags as Product[],
        version: q.version,
        questionSetVersion: q.question_set_version,
        isActive: q.is_active,
      },
    });
  }
  console.log(`seeded ${raw.questions.length} questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
