import type { Metadata } from 'next';
import Link from 'next/link';
import type { TypeCode } from '@contract';
import { CharacterArt } from '@/components/CharacterArt';
import { GRID16_ORDER, TYPE_NICKNAME, temperamentOf, TEMPERAMENT_LABEL, TEMPERAMENT_TINT_VAR, TEMPERAMENT_VAR, type Temperament } from '@/lib/report/typeMeta';

export const metadata: Metadata = {
  title: '16유형 라이브러리',
  description: '16가지 성격유형과 남/여 캐릭터를 기질 4그룹(분석가·외교관·관리자·탐험가)으로 둘러보세요.',
};

const GROUPS: Temperament[] = ['NT', 'NF', 'SJ', 'SP'];

/** 16유형 라이브러리 (마케팅·SEO) — SSR, 기질 4그룹 분할, 색+유형코드 텍스트 병기(§5.2). */
export default function LibraryPage() {
  const byTemp: Record<Temperament, TypeCode[]> = { NT: [], NF: [], SJ: [], SP: [] };
  for (const t of GRID16_ORDER) byTemp[temperamentOf(t)].push(t);

  return (
    <div className="wrap-wide">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>16유형 라이브러리</small></h1></Link>
        <Link className="ver" href="/select">검사 시작 →</Link>
      </div>

      <section className="card">
        <div className="eyebrow">16유형</div>
        <h2 className="sec">16가지 성격유형</h2>
        <p className="sec-sub">기질 4그룹으로 나눠 살펴보세요. 각 유형의 남성·여성 버전 캐릭터를 제공합니다(일러스트는 채점과 무관).</p>
      </section>

      {GROUPS.map((g) => (
        <section className="card" key={g}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 16, height: 16, borderRadius: 5, background: `var(${TEMPERAMENT_VAR[g]})` }} aria-hidden="true" />
            <h3 className="blk" style={{ margin: 0 }}>{TEMPERAMENT_LABEL[g]} <span className="token">({g})</span></h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
            {byTemp[g].map((t) => (
              <div key={t} className="card" style={{ margin: 0, background: `var(${TEMPERAMENT_TINT_VAR[g]})`, textAlign: 'center', padding: 14 }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'flex-end' }}>
                  <CharacterArt type={t} gender="F" size={84} />
                  <CharacterArt type={t} gender="M" size={84} />
                </div>
                <div style={{ marginTop: 8 }}>
                  <b className="token" style={{ fontSize: '.9rem', color: 'var(--ink)' }}>{t}</b>
                  <div style={{ fontSize: '.7rem', color: 'var(--sub)' }}>{TYPE_NICKNAME[t]}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="foot">캐릭터는 전량 자체 제작한 원본 벡터 일러스트(시안 v0.9)이며, 성 고정관념 없이 남/여 동등하게 설계했습니다.</div>
    </div>
  );
}
