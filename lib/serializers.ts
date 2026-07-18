// DB Result row(Json 컬럼) → 계약 Result 투영. camelCase·null 규약 준수.
import type {
  Result,
  ScoringOutput,
  Product,
  AvatarVersion,
  DimensionScores,
  Clarity,
  FunctionStack,
  Facets,
  Dimension,
  TypeCode,
  CharacterAsset,
  AssetVariant,
  ReportContentBlock,
  FacetKey,
} from '@contract';

/** ScoringOutput + IO 필드(resultToken 등) → 영속화용 Result. */
export function buildResult(args: {
  output: ScoringOutput;
  resultToken: string;
  sessionId: string;
  product: Product;
  avatarVersion: AvatarVersion;
  reportVersion: number;
  scoredAt: Date;
}): Result {
  const { output, resultToken, sessionId, product, avatarVersion, reportVersion, scoredAt } = args;
  return {
    resultToken,
    sessionId,
    typeCode: output.typeCode,
    product,
    avatarVersion,
    scores: output.scores,
    clarity: output.clarity,
    functionStack: output.functionStack,
    facets: output.facets,
    clarityIndex: output.clarityIndex,
    omittedCount: output.omittedCount,
    tieBreakApplied: output.tieBreakApplied,
    reportVersion,
    scoredAt: scoredAt.toISOString(),
  };
}

/** DB Result row(Json) → 계약 Result. */
export function dbResultToContract(row: {
  typeCode: string; product: string; scores: unknown; clarity: unknown; functionStack: unknown;
  facets: unknown; clarityIndex: number | null; omittedCount: number; tieBreakApplied: unknown;
  reportVersion: number; scoredAt: Date; sessionId: string;
}, resultToken: string, avatarVersion: string): Result {
  return {
    resultToken,
    sessionId: row.sessionId,
    typeCode: row.typeCode as TypeCode,
    product: row.product as Product,
    avatarVersion: avatarVersion as AvatarVersion,
    scores: row.scores as DimensionScores,
    clarity: row.clarity as Clarity,
    functionStack: row.functionStack as FunctionStack,
    facets: (row.facets as Facets | null) ?? null,
    clarityIndex: row.clarityIndex,
    omittedCount: row.omittedCount,
    tieBreakApplied: (row.tieBreakApplied as Dimension[] | null) ?? [],
    reportVersion: row.reportVersion,
    scoredAt: row.scoredAt.toISOString(),
  };
}

export function dbAssetToContract(a: {
  typeCode: string; gender: string; variant: string; fileUrl: string; fileName: string;
  altText: string; temperament: string; version: number;
}): CharacterAsset {
  return {
    typeCode: a.typeCode as CharacterAsset['typeCode'],
    gender: a.gender as AvatarVersion,
    variant: a.variant as AssetVariant,
    fileUrl: a.fileUrl,
    fileName: a.fileName,
    altText: a.altText,
    temperament: a.temperament as CharacterAsset['temperament'],
    version: a.version,
  };
}

export function dbContentToContract(c: {
  typeCode: string; blockKey: string; facetKey: string | null; body: unknown; minProduct: string; version: number;
}): ReportContentBlock {
  return {
    typeCode: c.typeCode as TypeCode,
    blockKey: c.blockKey,
    facetKey: (c.facetKey as FacetKey | null) ?? null,
    body: c.body,
    minProduct: c.minProduct as Product,
    version: c.version,
  };
}
