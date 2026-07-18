'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadLastResume } from '@/lib/storage';

/** 마이페이지 (P0 최소 · 이어하기 재개 진입). 결과 보관·PDF·관계 리포트는 P1(자리만). */
export default function MyPage() {
  const [resume, setResume] = useState<string | null>(null);
  useEffect(() => { setResume(loadLastResume()); }, []);

  return (
    <div className="wrap">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>마이페이지</small></h1></Link>
        <Link className="ver" href="/">← 홈</Link>
      </div>

      <section className="card">
        <div className="eyebrow">CONTINUE</div>
        <h2 className="sec">진행 중인 검사</h2>
        {resume ? (
          <>
            <p className="sec-sub">마지막으로 진행하던 검사를 이어서 할 수 있어요.</p>
            <Link className="btn btn-primary" href={`/resume/${encodeURIComponent(resume)}`}>이어서 하기</Link>
          </>
        ) : (
          <>
            <p className="sec-sub">진행 중인 검사가 없습니다.</p>
            <Link className="btn btn-primary" href="/select">새 검사 시작</Link>
          </>
        )}
      </section>

      <section className="card">
        <div className="eyebrow">SAVED</div>
        <h2 className="sec">내 결과 보관함</h2>
        <div className="note"><b>P1 예정</b> — 로그인 후 결과 저장·PDF 내보내기(F-14)·관계 리포트가 제공됩니다. 현재는 결과 링크로 접근하세요.</div>
      </section>
    </div>
  );
}
