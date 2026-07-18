'use client';
import { useMemo, useState } from 'react';
import type { ResultViewResponse, Product, AvatarVersion, SectionAvail } from '@contract';
import { SECTION_MATRIX, TIER_SCALE, UPGRADE_BANNER, PRODUCT_ORDER, PRODUCT_ITEM_COUNT } from '@contract';
import { toReportData } from '@/lib/report/toReportData';
import { ReportContent } from './reportContent';
import { ClarityGraph } from './ClarityGraph';
import { Grid16 } from './Grid16';
import { FunctionStack } from './FunctionStack';
import { FacetSection } from './FacetSection';
import { SummaryGraph } from './SummaryGraph';
import { TierBar } from './TierBar';
import { PlanTable } from './PlanTable';
import { CharacterPlaceholder } from '../CharacterPlaceholder';
import { TYPE_NICKNAME, DIMENSIONS, DIMENSION_POLES, CLARITY_BAND_KO } from '@/lib/report/typeMeta';

const PRODUCT_LABEL: Record<Product, string> = { basic: '간편 검사', standard: '일반 검사', pro: '전문 검사' };
const PRODUCT_CHIP: Record<Product, string> = {
  basic: '간편 검사 · 32문항 (약 5분)', standard: '일반 검사 · 72문항 (약 10분)', pro: '전문 검사 · 144문항 (15~20분)',
};

/** 미제공(none) 안내 — 숨기지 않고 "상위 검사에서 제공"(부록 D 표기 원칙). */
function Locked({ title, targets }: { title: string; targets: Product[] }) {
  const to = targets.map((t) => PRODUCT_LABEL[t]).join(' · ');
  return (
    <div className="locked print-hide">
      <div className="ico" aria-hidden="true">🔒</div>
      <div>
        <b>{title}</b>
        <p>이 항목은 {to || '상위 검사'}에서 제공됩니다. 이어하기 승급으로 기존 응답을 재사용해 바로 확장할 수 있어요.</p>
      </div>
    </div>
  );
}

export function ReportView({ data }: { data: ResultViewResponse }) {
  const { result, content: rawContent, sections: serverSections } = data;
  const owned = result.product;
  const [view, setView] = useState<Product>(owned);
  const [gender, setGender] = useState<AvatarVersion>(result.avatarVersion);

  const reportData = useMemo(() => toReportData(result), [result]);
  const content = useMemo(() => new ReportContent(rawContent), [rawContent]);

  // 부록 D: 소유 상품은 서버 계산 sections를 그대로 사용(재해석 금지, 03_backend §95).
  // 미리보기(다른 티어)만 계약 상수 SECTION_MATRIX로 파생 — 서버도 같은 상수로 계산하므로 발산 없음.
  const isOwnedView = view === owned;
  const avail = (key: string): SectionAvail =>
    (isOwnedView ? serverSections.sections[key] : SECTION_MATRIX[key]?.[view]) ?? 'none';
  const scale = isOwnedView ? serverSections.scale : TIER_SCALE[view];
  const upgradeTargets = isOwnedView ? serverSections.upgradeTargets : UPGRADE_BANNER[view];
  const canPreview = PRODUCT_ORDER.indexOf(view) > PRODUCT_ORDER.indexOf(owned);

  const type = result.typeCode;
  const nick = TYPE_NICKNAME[type];
  const claritySummary = DIMENSIONS.map((dim) => {
    const c = result.clarity[dim];
    return { pole: c.pole, score: c.score, band: c.band };
  });

  return (
    <div className="wrap" data-tier={view}>
      {/* 상단바 */}
      <div className="topbar">
        <a className="brand" href="/">
          <div className="logo">MT</div>
          <h1>성격유형 전문해석 결과보고서<small>{PRODUCT_LABEL[view]} · FORM v2.0</small></h1>
        </a>
        <span className="ver">{`FORM v2.0 · ${view.toUpperCase()}`}</span>
      </div>

      {/* 검사 유형 전환(미리보기) */}
      <TierBar value={view} owned={owned} onChange={setView} />
      {canPreview && (
        <div className="note print-hide" style={{ marginTop: '-8px' }}>
          🔎 <b>{PRODUCT_LABEL[view]} 미리보기</b> — 현재 검사는 <b>{PRODUCT_LABEL[owned]}</b>입니다. 잠긴 항목은 승급 시 채워집니다.
        </div>
      )}

      {/* 표지 */}
      <section className="card cover">
        <div className="eyebrow">PROFILE REPORT</div>
        <h2 className="sec">나의 성격유형 프로파일</h2>
        <div style={{ margin: '10px 0 4px' }}>
          <span className="chip">{PRODUCT_CHIP[view]}</span>
        </div>
        <div className="type-line">
          <span className="lbl">나의 성격유형 :</span>
          <div className="type-badge">{type}</div>
          <div>
            <div style={{ fontWeight: 800 }}>{nick}</div>
            <div className="token">{content.text('nickname') ?? ''}</div>
          </div>
        </div>
        {/* 버전 토글 (F-17, 재채점 없이 이미지/톤만) */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <CharacterPlaceholder type={type} gender={gender} size={110} />
          <div className="print-hide">
            <div className="note" style={{ marginTop: 0 }}>일러스트 버전 (채점·유형 판정과 무관)</div>
            <div className="tier-bar" role="tablist" aria-label="캐릭터 버전 전환" style={{ marginTop: 8, maxWidth: 220 }}>
              <button role="tab" aria-selected={gender === 'F'} className={gender === 'F' ? 'on' : ''} onClick={() => setGender('F')}><b>여성 버전</b></button>
              <button role="tab" aria-selected={gender === 'M'} className={gender === 'M' ? 'on' : ''} onClick={() => setGender('M')}><b>남성 버전</b></button>
            </div>
          </div>
        </div>
        <div className="note"><b>안내</b> — 본 검사는 성격의 우열이나 능력을 평가하지 않으며, 개인의 타고난 선호경향을 알아보는 자기이해 도구입니다.</div>
      </section>

      {/* 검사 구성 안내 */}
      <section className="card">
        <span className="sec-no">PLAN</span>
        <div className="eyebrow">TEST PLAN</div>
        <h2 className="sec">검사 구성 안내 — 3종 차등</h2>
        <p className="sec-sub">모든 검사는 동일한 144문항 은행에서 지표별 균형 추출되며, 문항 수에 따라 해석 깊이가 달라집니다.</p>
        <PlanTable current={view} />
      </section>

      {/* Ⅰ 프로파일 보기 전에 */}
      <section className="card pagebreak">
        <span className="sec-no">SECTION Ⅰ</span>
        <div className="eyebrow">BEFORE READING</div>
        <h2 className="sec">Ⅰ. 프로파일을 보기 전에</h2>
        {avail('sec1_before') === 'none' ? (
          <Locked title="4가지 선호지표 해설" targets={upgradeTargets} />
        ) : (
          <>
            <p className="sec-sub">성격유형을 구성하는 4가지 선호지표입니다. 각 지표에서 더 선호하는 특성을 조합하면 16가지 유형이 됩니다.</p>
            <Dichotomies />
          </>
        )}
      </section>

      {/* Ⅱ 기본 결과 */}
      <section className="card pagebreak">
        <span className="sec-no">SECTION Ⅱ</span>
        <div className="eyebrow">STEP Ⅰ RESULT</div>
        <h2 className="sec">Ⅱ. 기본 검사 결과 — 4가지 선호지표</h2>
        <p className="sec-sub">막대의 방향은 선호 방향을, 길이는 선호의 일관된 정도(분명도)를 나타냅니다.</p>
        <h3 className="blk">선호 분명도 (Clarity of Preferences)</h3>
        <ClarityGraph
          clarity={reportData.clarity}
          product={view}
          advisory={scale.clarityAdvisory && avail('sec2_clarity') === 'partial'}
          index={claritySummary}
        />
        <h3 className="blk">16가지 성격유형도표</h3>
        <Grid16 myType={reportData.myType} />
      </section>

      {/* Ⅲ 유형 프로파일 */}
      <section className="card pagebreak">
        <span className="sec-no">SECTION Ⅲ</span>
        <div className="eyebrow">TYPE PROFILE</div>
        <h2 className="sec">Ⅲ. {type}인 나는 어떤 사람인가?</h2>

        <div className="type-head">
          <div className="type-badge">{type}</div>
          <div className="nick">
            <span className="chip">유형 별칭</span>
            <div className="slot" style={{ marginTop: 6 }}>{content.text('nickname') ?? nick}</div>
          </div>
        </div>

        <h3 className="blk">대표 키워드</h3>
        <div className="kw-grid">
          {(content.list('keywords') ?? []).map((kw, i) => <div className="slot" key={i}>{kw}</div>)}
        </div>

        {avail('sec3_narrative') === 'none' ? (
          <div style={{ marginTop: 16 }}><Locked title="유형 종합 해설 · 구체적 특성(강점·업무·관계·개발점)" targets={upgradeTargets} /></div>
        ) : (
          <>
            <h3 className="blk">유형 종합 해설</h3>
            <div className={`slot tall${content.text('narrative') ? '' : ' empty'}`}>{content.text('narrative') ?? '해설 준비 중'}</div>
            <h3 className="blk">보다 구체적인 특성</h3>
            <div className="trait4">
              <TraitCard cls="g" ico="💪" title="일반적인 강점들" items={content.list('strengths')} />
              <TraitCard cls="w" ico="🏢" title="생산적인 업무 환경과 목표" items={content.list('workEnv')} />
              <TraitCard cls="r" ico="🤝" title="대인 관계 스타일" items={content.list('relationships')} />
              <TraitCard cls="d" ico="🌱" title="개발이 필요한 점" items={content.list('growth')} />
            </div>
          </>
        )}
        <div className="note"><b>결과가 자신에게 적합하다고 생각되십니까?</b> — 분명도 지수가 낮은 지표는 반대선호도 함께 고려할 수 있습니다.</div>
      </section>

      {/* Ⅳ 심리기능 */}
      <section className="card pagebreak">
        <span className="sec-no">SECTION Ⅳ</span>
        <div className="eyebrow">TYPE DYNAMICS</div>
        <h2 className="sec">Ⅳ. 심리적 기능 및 상호작용</h2>
        {avail('sec4_stack') === 'none' ? (
          <Locked title="심리기능 위계(주기능→부기능→3차기능→열등기능)" targets={upgradeTargets} />
        ) : (
          <>
            <p className="sec-sub">인식기능(S/N)과 판단기능(T/F)을 얼마나 자주·편안하게 쓰느냐에 따라 주기능·부기능·3차기능·열등기능으로 구분됩니다.</p>
            <h3 className="blk">나의 심리적 기능 위계</h3>
            <FunctionStack stack={result.functionStack} />
            {avail('sec4_dynamics') === 'none' ? (
              <div style={{ marginTop: 14 }}><Locked title="기능 상호작용 · 스트레스 반응 해설" targets={upgradeTargets} /></div>
            ) : (
              <>
                <div className="dyn2" style={{ marginTop: 14 }}>
                  <div>
                    <h3 className="blk" style={{ marginTop: 6 }}>긍정적 상호작용</h3>
                    <div className={`slot tall${content.text('positive_dynamics') ? '' : ' empty'}`}>{content.text('positive_dynamics') ?? '—'}</div>
                  </div>
                  <div>
                    <h3 className="blk" style={{ marginTop: 6 }}>부정적 상호작용</h3>
                    <div className={`slot tall${content.text('negative_dynamics') ? '' : ' empty'}`}>{content.text('negative_dynamics') ?? '—'}</div>
                  </div>
                </div>
                <h3 className="blk">기능 불균형 상황별 반응</h3>
                <div className="stress4">
                  <div className="item"><b>① 주·부기능을 과도하게 사용할 경우</b><div className="slot">{content.text('overuse') ?? '—'}</div></div>
                  <div className="item"><b>② 주·부기능의 사용이 억제될 경우</b><div className="slot">{content.text('suppressed') ?? '—'}</div></div>
                  <div className="item"><b>③ 3차·열등기능이 지나치게 무시될 경우</b><div className="slot">{content.text('ignored') ?? '—'}</div></div>
                  <div className="item"><b>④ 스트레스를 심하게 받을 경우</b><div className="slot">{content.text('stress') ?? '—'}</div></div>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Ⅴ 다면척도 (pro) */}
      <section className="card pagebreak">
        <span className="sec-no">SECTION Ⅴ</span>
        <div className="eyebrow">FACET SCALES</div>
        <h2 className="sec">Ⅴ. 심층 다면척도 결과 (20개 척도)</h2>
        {avail('sec5_facets') === 'none' || !reportData.facets.EI1 ? (
          <Locked title="20개 심층 다면척도 프로파일과 해설" targets={upgradeTargets.length ? upgradeTargets : ['pro']} />
        ) : (
          <>
            <p className="sec-sub">4가지 선호지표에 각각 5개 다면척도가 대응합니다. 결과는 <b>선호 내 / 중간범위 / 선호 외</b>로 구분해 해설합니다.</p>
            <FacetSection facets={reportData.facets} content={content} />
          </>
        )}
      </section>

      {/* 결과요약 */}
      <section className="card pagebreak">
        <span className="sec-no">SUMMARY</span>
        <div className="eyebrow">RESULT SUMMARY</div>
        <h2 className="sec">결과요약</h2>
        {avail('summary_clarity') === 'none' ? (
          <Locked title="선호 분명도 지수 요약" targets={upgradeTargets} />
        ) : (
          <>
            <h3 className="blk">선호 분명도 지수 요약</h3>
            <div className="sum-badges">
              {DIMENSIONS.map((dim, i) => {
                const s = claritySummary[i];
                const poles = DIMENSION_POLES[dim];
                return (
                  <div className="sumb" key={dim}>
                    <div className="k">{poles.L.ko}/{poles.R.ko} ({poles.L.code}/{poles.R.code})</div>
                    <div className="slot">{poles[s.pole].ko}({poles[s.pole].code}) : {CLARITY_BAND_KO[s.band]}({s.score})</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {avail('summary_facets') === 'none' ? (
          <div style={{ marginTop: 14 }}><Locked title="다면척도 종합 그래프 · 일관성 지수 · 전문가 소견" targets={upgradeTargets.length ? upgradeTargets : ['pro']} /></div>
        ) : (
          <>
            <h3 className="blk">다면척도 종합 프로파일 (20개 척도)</h3>
            <SummaryGraph facets={reportData.facets} />
            <div className="stat-row">
              <div className="stat">
                <b>일관성 지수 (0~100)</b>
                <div className="slot center">{result.clarityIndex ?? '—'}</div>
                <p style={{ fontSize: '.68rem', color: 'var(--sub)', marginTop: 8 }}>성인 대부분 50~65 범위이며, 45 미만이면 타당성 검토가 필요합니다.</p>
              </div>
              <div className="stat">
                <b>무응답 수</b>
                <div className="slot center">{result.omittedCount}</div>
                <p style={{ fontSize: '.68rem', color: 'var(--sub)', marginTop: 8 }}>무응답이 많을수록 결과 정확도가 낮아질 수 있습니다.</p>
              </div>
            </div>
            <h3 className="blk">전문가 종합 소견</h3>
            <div className={`slot tall${content.text('examiner_opinion') ? '' : ' empty'}`}>{content.text('examiner_opinion') ?? '—'}</div>
          </>
        )}

        {result.tieBreakApplied.length > 0 && (
          <div className="note"><b>동점 보정 고지</b> — {result.tieBreakApplied.join(', ')} 지표에서 동점 규칙(I/N/F/P)이 적용되었습니다.</div>
        )}
      </section>

      {/* 업그레이드 배너 (F-19) */}
      {upgradeTargets.length > 0 && (
        <div className="upsell print-hide">
          <b>더 깊이 알고 싶다면 — {upgradeTargets.map((t) => `${PRODUCT_LABEL[t]}(${PRODUCT_ITEM_COUNT[t].total}문항)`).join(' / ')}</b>
          <p>이어하기 승급으로 지금까지의 응답을 재사용하고 잔여 문항만 추가하면 됩니다. 20개 다면척도·기능 상호작용·전문가 소견까지 확장됩니다.</p>
          <a className="btn btn-primary cta" href={`/select?upgradeFrom=${result.sessionId}`}>이어하기 승급</a>
        </div>
      )}

      <div className="foot">
        본 보고서는 자기이해 자료이며, 채용·선발·평가 목적으로 사용할 수 없습니다.<br />
        결과 해석은 자격을 갖춘 전문가 상담을 권장합니다. · <span className="token">FORM v2.0 · 마인드타입</span>
      </div>
    </div>
  );
}

function TraitCard({ cls, ico, title, items }: { cls: string; ico: string; title: string; items: string[] | null }) {
  return (
    <div className={`trait ${cls}`}>
      <h4><span className="ico" aria-hidden="true">{ico}</span>{title}</h4>
      {items && items.length ? (
        <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
      ) : (
        <div className="slot empty">내용 준비 중</div>
      )}
    </div>
  );
}

function Dichotomies() {
  const rows: { l: string; lc: string; m: string; ms: string; r: string; rc: string; ld: string; rd: string }[] = [
    { l: '외향', lc: '(E)xtraversion', m: '에너지 방향', ms: 'ENERGY', r: '내향', rc: '(I)ntroversion', ld: '외부 세계의 사람·사물에 에너지를 사용', rd: '내부 세계의 개념·아이디어에 에너지를 사용' },
    { l: '감각', lc: '(S)ensing', m: '인식기능', ms: 'INFORMATION', r: '직관', rc: 'i(N)tuition', ld: '오감을 통한 사실·사건을 잘 인식', rd: '사실 이면의 의미·관계·가능성을 잘 인식' },
    { l: '사고', lc: '(T)hinking', m: '판단기능', ms: 'DECISION', r: '감정', rc: '(F)eeling', ld: '논리적·분석적 근거로 판단', rd: '개인적·사회적 가치로 판단' },
    { l: '판단', lc: '(J)udging', m: '생활양식', ms: 'LIFE STYLE', r: '인식', rc: '(P)erceiving', ld: '체계적·계획적으로 접근', rd: '개방적·융통성 있게 접근' },
  ];
  return (
    <div className="dich">
      {rows.map((r) => (
        <div className="dich-row" key={r.ms}>
          <div className="pole"><b>{r.l} <i>{r.lc}</i></b><p>{r.ld}</p></div>
          <div className="dich-mid"><span><small>{r.ms}</small>{r.m}</span></div>
          <div className="pole"><b>{r.r} <i>{r.rc}</i></b><p>{r.rd}</p></div>
        </div>
      ))}
    </div>
  );
}
