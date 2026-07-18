import type { ReportContentBlock, FacetKey } from '@contract';

/**
 * ReportContentBlock[] 인덱서 — 표준양식 {{slot}}을 안전하게 조회.
 * body가 unknown이므로 타입 가드로 narrow(캐스팅 우회 금지).
 */
export class ReportContent {
  private byKey = new Map<string, ReportContentBlock>();
  private facet = new Map<string, ReportContentBlock>();

  constructor(blocks: ReportContentBlock[]) {
    for (const b of blocks) {
      if (b.blockKey === 'facet_expl' && b.facetKey) this.facet.set(b.facetKey, b);
      else this.byKey.set(b.blockKey, b);
    }
  }

  text(key: string): string | null {
    const b = this.byKey.get(key);
    return typeof b?.body === 'string' ? b.body : null;
  }

  list(key: string): string[] | null {
    const b = this.byKey.get(key);
    if (Array.isArray(b?.body) && b!.body.every((x) => typeof x === 'string')) return b!.body as string[];
    return null;
  }

  facetExpl(key: FacetKey): string | null {
    const b = this.facet.get(key);
    return typeof b?.body === 'string' ? b.body : null;
  }

  has(key: string): boolean { return this.byKey.has(key); }
}
