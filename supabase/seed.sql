-- ============================================================================
-- 마인드타입 — 문항 시드 (대표 샘플 24문항)
-- 원천: _workspace/01_architect_mapping_sample.json (architect 검증본, facet 20/20)
-- 선행: supabase/schema.sql 실행 후 이 파일 실행.
-- 주의: 대표 샘플이라 상품별 절대 문항 수(basic 8/standard 18/pro 36)는 미충족.
--       144문항 실데이터 확정(R1) 후 CMS 또는 prisma/seed.ts로 교체.
-- 재실행 안전: 동일 id 존재 시 갱신(UPSERT).
-- ============================================================================
INSERT INTO "Question"
  ("id","code","part","format","dimension","poleA","poleB","textA","textB","stem",
   "facet","facetPoleA","facetPoleB","productTags","version","questionSetVersion","isActive","createdAt","updatedAt")
VALUES
  ('Q001', 'Q001', 1, 'sentence'::"Format", 'EI'::"Dimension", 'L'::"Pole", 'R'::"Pole", '먼저 말을 걸고 대화를 주도하는 편이다', '누군가 소개해 주기를 기다리는 편이다', '처음 보는 사람들과 있을 때 나는', 'EI1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q021', 'Q021', 2, 'word_pair'::"Format", 'EI'::"Dimension", 'L'::"Pole", 'R'::"Pole", '나서기', '지켜보기', NULL, 'EI1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q002', 'Q002', 1, 'sentence'::"Format", 'EI'::"Dimension", 'L'::"Pole", 'R'::"Pole", '겉으로 잘 드러내고 말로 표현한다', '속으로 간직하고 아껴 둔다', '감정이나 생각을', 'EI2', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q003', 'Q003', 1, 'sentence'::"Format", 'EI'::"Dimension", 'L'::"Pole", 'R'::"Pole", '폭넓고 다양하게 맺는 편이 좋다', '소수와 깊고 밀접하게 맺는 편이 좋다', '인간관계는', 'EI3', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q004', 'Q004', 2, 'word_pair'::"Format", 'EI'::"Dimension", 'L'::"Pole", 'R'::"Pole", '참여', '관망', NULL, 'EI4', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q005', 'Q005', 2, 'word_pair'::"Format", 'EI'::"Dimension", 'L'::"Pole", 'R'::"Pole", '활기참', '차분함', NULL, 'EI5', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q006', 'Q006', 1, 'sentence'::"Format", 'SN'::"Dimension", 'L'::"Pole", 'R'::"Pole", '정확한 사실을 그대로 알려 주는 편이 좋다', '비유나 상징으로 큰 그림을 알려 주는 편이 좋다', '설명을 들을 때 나는', 'SN1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q022', 'Q022', 2, 'word_pair'::"Format", 'SN'::"Dimension", 'L'::"Pole", 'R'::"Pole", '사실', '상상', NULL, 'SN1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q007', 'Q007', 2, 'word_pair'::"Format", 'SN'::"Dimension", 'L'::"Pole", 'R'::"Pole", '현실', '창의', NULL, 'SN2', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q008', 'Q008', 3, 'sentence'::"Format", 'SN'::"Dimension", 'L'::"Pole", 'R'::"Pole", '당장 쓸모 있는 실용성을 먼저 본다', '밑바탕에 깔린 개념과 아이디어를 먼저 본다', '일을 볼 때 나는', 'SN3', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q009', 'Q009', 2, 'word_pair'::"Format", 'SN'::"Dimension", 'L'::"Pole", 'R'::"Pole", '경험', '이론', NULL, 'SN4', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q010', 'Q010', 2, 'word_pair'::"Format", 'SN'::"Dimension", 'L'::"Pole", 'R'::"Pole", '전통', '독창', NULL, 'SN5', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q011', 'Q011', 3, 'sentence'::"Format", 'TF'::"Dimension", 'L'::"Pole", 'R'::"Pole", '객관적 논리와 근거를 우선한다', '사람들의 마음과 개인적 가치를 우선한다', '결정을 내릴 때 나는', 'TF1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q023', 'Q023', 2, 'word_pair'::"Format", 'TF'::"Dimension", 'L'::"Pole", 'R'::"Pole", '사고', '감정', NULL, 'TF1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q012', 'Q012', 2, 'word_pair'::"Format", 'TF'::"Dimension", 'L'::"Pole", 'R'::"Pole", '공정', '배려', NULL, 'TF2', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q013', 'Q013', 3, 'sentence'::"Format", 'TF'::"Dimension", 'L'::"Pole", 'R'::"Pole", '따져 묻고 토론하며 짚는 편이다', '공감하고 동의하며 조화를 찾는 편이다', '논의할 때 나는', 'TF3', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q014', 'Q014', 2, 'word_pair'::"Format", 'TF'::"Dimension", 'L'::"Pole", 'R'::"Pole", '비평', '격려', NULL, 'TF4', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q015', 'Q015', 2, 'word_pair'::"Format", 'TF'::"Dimension", 'L'::"Pole", 'R'::"Pole", '단호', '온건', NULL, 'TF5', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q016', 'Q016', 1, 'sentence'::"Format", 'JP'::"Dimension", 'L'::"Pole", 'R'::"Pole", '언제 무엇을 할 것인지 계획하는 편이다', '별 계획 없이 훌쩍 떠나는 편이다', '하루 정도 어디를 다녀오고 싶을 때 나는', 'JP1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q024', 'Q024', 2, 'word_pair'::"Format", 'JP'::"Dimension", 'L'::"Pole", 'R'::"Pole", '체계', '유연', NULL, 'JP1', 'L'::"Pole", 'R'::"Pole", ARRAY['basic','standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q017', 'Q017', 3, 'sentence'::"Format", 'JP'::"Dimension", 'L'::"Pole", 'R'::"Pole", '목표와 미래 계획에 초점을 둔다', '지금 상황에 열려 있는 편이다', '일을 대할 때 나는', 'JP2', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q018', 'Q018', 2, 'word_pair'::"Format", 'JP'::"Dimension", 'L'::"Pole", 'R'::"Pole", '조기착수', '임박착수', NULL, 'JP3', 'L'::"Pole", 'R'::"Pole", ARRAY['standard','pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q019', 'Q019', 2, 'word_pair'::"Format", 'JP'::"Dimension", 'L'::"Pole", 'R'::"Pole", '계획', '자발', NULL, 'JP4', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now()),
  ('Q020', 'Q020', 5, 'sentence'::"Format", 'JP'::"Dimension", 'L'::"Pole", 'R'::"Pole", '순서와 방법을 정해 조직적으로 접근한다', '일단 뛰어들어 과정에서 맞춰 간다', '과업을 시작할 때 나는', 'JP5', 'L'::"Pole", 'R'::"Pole", ARRAY['pro']::"Product"[], 1, 1, true, now(), now())
ON CONFLICT ("id") DO UPDATE SET
  "code"=EXCLUDED."code", "part"=EXCLUDED."part", "format"=EXCLUDED."format",
  "dimension"=EXCLUDED."dimension", "poleA"=EXCLUDED."poleA", "poleB"=EXCLUDED."poleB",
  "textA"=EXCLUDED."textA", "textB"=EXCLUDED."textB", "stem"=EXCLUDED."stem",
  "facet"=EXCLUDED."facet", "facetPoleA"=EXCLUDED."facetPoleA", "facetPoleB"=EXCLUDED."facetPoleB",
  "productTags"=EXCLUDED."productTags", "version"=EXCLUDED."version",
  "questionSetVersion"=EXCLUDED."questionSetVersion", "isActive"=EXCLUDED."isActive",
  "updatedAt"=now();

-- 검증: SELECT dimension, count(*) FROM "Question" GROUP BY dimension ORDER BY dimension;

