import Link from 'next/link';

/**
 * CMS 대시보드 (UI 스텁, P1). API는 backend 소유(app/api/admin/**).
 * 문항 매핑표(product_tags·facet)·리포트 콘텐츠·에셋 34종·네이밍 검증을 관리할 진입점만 배치.
 */
const SECTIONS = [
  { key: 'questions', title: '문항 매핑표', desc: 'product_tags·facet·극 균형(§4.4) 관리. balance 리포트로 검증.', api: 'GET/PUT /api/admin/questions' },
  { key: 'report-content', title: '리포트 콘텐츠', desc: '16유형×블록(별칭·키워드·해설·다면척도 해설) CRUD.', api: 'GET/PUT /api/admin/report-content' },
  { key: 'assets', title: '캐릭터 에셋 34종', desc: '{TYPE}_{M|F} 네이밍·alt 규칙 검증, 누락 추적(§6.4).', api: 'GET/PUT /api/admin/assets' },
];

export default function AdminPage() {
  return (
    <div className="wrap-wide">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>CMS (관리자)</small></h1></Link>
        <span className="ver">P1 · UI 스텁</span>
      </div>

      <section className="card">
        <div className="eyebrow">CONTENT MANAGEMENT</div>
        <h2 className="sec">콘텐츠 관리</h2>
        <p className="sec-sub">아래 도메인의 편집 UI가 배치됩니다. 데이터 접근은 backend API가 담당합니다(프론트는 UI만).</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        {SECTIONS.map((s) => (
          <div className="card" key={s.key} style={{ margin: 0 }}>
            <h3 className="blk">{s.title}</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--sub)' }}>{s.desc}</p>
            <div className="token" style={{ fontSize: '.72rem', marginTop: 10 }}>{s.api}</div>
            <div className="chip info" style={{ marginTop: 10 }}>실 API 연결 대기</div>
          </div>
        ))}
      </div>
    </div>
  );
}
