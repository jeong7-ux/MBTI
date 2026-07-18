import type { Metadata } from 'next';
import { getResult } from '@/lib/api';
import { ReportView } from '@/components/report/ReportView';
import { Teaser } from '@/components/result/Teaser';
import { ReportContent } from '@/components/report/reportContent';
import { TYPE_NICKNAME } from '@/lib/report/typeMeta';

/** 결과 페이지 — SSR. 티저 → 심층 리포트(표준양식 이식). OG 카드 자동 생성(opengraph-image). */
export default async function ResultPage({ params }: { params: { token: string } }) {
  const data = await getResult(params.token);
  const content = new ReportContent(data.content);
  const nickname = content.text('nickname') ?? `${data.result.typeCode} · ${TYPE_NICKNAME[data.result.typeCode]}`;

  return (
    <>
      <div className="wrap" style={{ paddingBottom: 0 }}>
        <Teaser type={data.result.typeCode} gender={data.result.avatarVersion} oneLiner={nickname} />
      </div>
      <div id="report">
        <ReportView data={data} />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  try {
    const data = await getResult(params.token);
    const t = data.result.typeCode;
    const title = `${t} · ${TYPE_NICKNAME[t]} — 내 성격유형 결과`;
    // OG 이미지는 backend의 자기완결 SVG 라우트를 사용(선택 성별 캐릭터 합성, next/og 오프라인 폰트 이슈 회피).
    const ogImage = `/api/results/${encodeURIComponent(params.token)}/og`;
    return {
      title,
      description: `마인드타입 ${data.result.product} 검사 결과: ${t} ${TYPE_NICKNAME[t]}`,
      openGraph: { title, type: 'article', images: [{ url: ogImage, width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', title, images: [ogImage] },
    };
  } catch {
    return { title: '성격유형 결과' };
  }
}
