import Link from 'next/link';
import { PlanTable } from '@/components/report/PlanTable';

/** 랜딩 (마케팅 표면 · 적극 표현). trust-first — 정직·차분·판독성. */
export default function LandingPage() {
  return (
    <div className="wrap-wide">
      <div className="topbar">
        <Link className="brand" href="/">
          <div className="logo">MT</div>
          <h1>마인드타입<small>전문 성격유형 검사</small></h1>
        </Link>
        <Link className="ver" href="/library">16유형 라이브러리</Link>
      </div>

      {/* 히어로 */}
      <section className="card reveal" style={{ padding: '40px 28px' }}>
        <div className="eyebrow">전문 성격유형 검사</div>
        <h2 className="sec" style={{ fontSize: '2rem', lineHeight: 1.25 }}>
          재미용 12문항이 아니라,<br />전문 검사 절차를 그대로.
        </h2>
        <p className="sec-sub" style={{ fontSize: '.95rem', maxWidth: '52ch' }}>
          오리엔테이션 → 문항 응답 → 심층 해석. 채점 결과가 점수와 그래프로 입증되는
          전문 결과보고서를 받아보세요. 간편·일반·전문 3종 중 선택할 수 있어요.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
          <Link className="btn btn-primary" href="/select">검사 시작하기</Link>
          <Link className="btn" href="/library">유형 둘러보기</Link>
        </div>
        <div className="note" style={{ maxWidth: '52ch' }}>
          <b>언제든 이어서</b> — 144문항이 부담되면 잠시 멈춰도 괜찮아요. 응답은 자동 저장되고, 재개 링크로 마지막 문항부터 이어집니다.
        </div>
      </section>

      {/* 3종 비교 */}
      <section className="card">
        <h2 className="sec">문항 수에 따른 3종 차등</h2>
        <p className="sec-sub">동일한 문항은행·채점 엔진 위에서 해석 깊이가 달라집니다. 처음이라면 <b>일반 검사</b>를 추천해요.</p>
        <PlanTable current="standard" />
        <Link className="btn btn-primary" href="/select" style={{ marginTop: 16 }}>상품 선택하러 가기</Link>
      </section>

      {/* 절차 안내 */}
      <section className="card">
        <h2 className="sec">검사 진행 절차</h2>
        <div className="toc-flow" style={{ marginTop: 12 }}>
          <Step no="1" title="상품·버전 선택" desc="검사 종류(간편/일반/전문)와 일러스트 버전을 고릅니다." />
          <Step no="2" title="오리엔테이션" desc="정확한 응답을 위한 5가지 원칙을 확인합니다." />
          <Step no="3" title="문항 응답" desc="첫 직관대로 양자택일. 진행률과 파트 브릿지로 리듬감 있게." />
          <Step no="4" title="심층 결과 리포트" desc="선호 분명도·심리기능·다면척도까지 전문 해석." />
        </div>
      </section>

      <div className="foot">
        본 검사는 성격의 우열·능력을 평가하지 않으며, 채용·선발 목적으로 사용할 수 없습니다. · 마인드타입
      </div>
    </div>
  );
}

function Step({ no, title, desc }: { no: string; title: string; desc: string }) {
  return (
    <div className="toc-item">
      <div className="no">{no}</div>
      <div className="body"><b>{title}</b><span>{desc}</span></div>
    </div>
  );
}
