import type { Metadata, Viewport } from 'next';
import MockBadge from '@/components/MockBadge';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '마인드타입 — 전문 성격유형 검사',
    template: '%s · 마인드타입',
  },
  description:
    '오리엔테이션부터 144문항, 심층 해석까지 — 전문 검사 절차를 그대로 옮긴 성격유형 검사. 간편·일반·전문 3종 차등 리포트.',
  metadataBase: new URL('https://mindtype.example'),
  openGraph: {
    type: 'website',
    siteName: '마인드타입',
    title: '마인드타입 — 전문 성격유형 검사',
    description: '전문 검사 절차를 그대로 옮긴 성격유형 검사',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#EDF1F5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard (디자인 시스템 §1.3 지정 폰트). CDN 미도달 시 시스템 폰트로 우아하게 폴백. */}
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        {children}
        <MockBadge />
      </body>
    </html>
  );
}
