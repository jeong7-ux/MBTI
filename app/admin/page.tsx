'use client';
/**
 * 관리자 대시보드 (CMS 진입 + DB 초기화). 클라이언트 상태 머신.
 *
 * 상태: authed === null(세션 확인 중) → false(로그인 게이트) / true(대시보드).
 * 소비 엔드포인트(backend 소유 · 확정 계약, 쿠키 기반 httpOnly 인증):
 *   GET  /api/admin/session → { authed:boolean }                     (항상 200)
 *   POST /api/admin/login   { username, password } → { ok:true } / 401 INVALID_CREDENTIALS
 *   POST /api/admin/logout  → { ok:true }
 *   POST /api/admin/reset   { confirm:'DELETE_ALL' } → { ok:true, deleted:{...} } / 401 ADMIN_UNAUTHORIZED
 * 에러는 계약상 { error:{ code, message } } 래핑 → fetchJson이 ApiRequestError로 throw.
 */
import { useEffect, useState, useCallback, type FormEvent } from 'react';
import Link from 'next/link';
import { fetchJson, ApiRequestError } from '@/lib/api';

/* ── 확정 계약 응답 shape (backend 제공 · 그대로 소비) ── */
interface AdminSessionResponse { authed: boolean; }
interface AdminOkResponse { ok: true; }
interface AdminResetResponse { ok: true; deleted: { results: number; responses: number; sessions: number }; }

/* 로그인 뒤에서만 보이는 기존 CMS 스텁 3섹션(보존). API는 backend 소유. */
const SECTIONS = [
  { key: 'questions', title: '문항 매핑표', desc: 'product_tags·facet·극 균형(§4.4) 관리. balance 리포트로 검증.', api: 'GET/PUT /api/admin/questions' },
  { key: 'report-content', title: '리포트 콘텐츠', desc: '16유형×블록(별칭·키워드·해설·다면척도 해설) CRUD.', api: 'GET/PUT /api/admin/report-content' },
  { key: 'assets', title: '캐릭터 에셋 34종', desc: '{TYPE}_{M|F} 네이밍·alt 규칙 검증, 누락 추적(§6.4).', api: 'GET/PUT /api/admin/assets' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', minHeight: 44, padding: '10px 12px', borderRadius: 10,
  border: '1.5px solid var(--line)', background: '#fff', color: 'var(--ink)',
  fontFamily: 'inherit', fontSize: '.92rem',
};
const labelStyle: React.CSSProperties = { fontSize: '.78rem', fontWeight: 800, color: 'var(--sub)' };

export default function AdminPage() {
  // null = 세션 확인 중, false = 미인증, true = 인증됨
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { authed: a } = await fetchJson<AdminSessionResponse>('/api/admin/session', { credentials: 'same-origin' });
        if (alive) setAuthed(a === true);
      } catch {
        // 세션 확인 실패(라우트 미완/네트워크 오류) → 안전하게 로그인 게이트로.
        if (alive) setAuthed(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="wrap-wide">
      <div className="topbar">
        <Link className="brand" href="/"><div className="logo">MT</div><h1>마인드타입<small>CMS (관리자)</small></h1></Link>
        {authed
          ? <LogoutButton onDone={() => setAuthed(false)} />
          : <Link className="ver" href="/">← 홈</Link>}
      </div>

      {authed === null && <SessionLoading />}
      {authed === false && <LoginGate onAuthed={() => setAuthed(true)} />}
      {authed === true && <Dashboard onSessionExpired={() => setAuthed(false)} />}
    </div>
  );
}

/* ══════════════════ 세션 확인 중 (스켈레톤) ══════════════════ */
function SessionLoading() {
  return (
    <section className="card" aria-busy="true" aria-live="polite">
      <div className="eyebrow">ADMIN</div>
      <h2 className="sec">세션 확인 중…</h2>
      <p className="sec-sub">관리자 인증 상태를 확인하고 있어요.</p>
    </section>
  );
}

/* ══════════════════ 로그아웃 버튼 ══════════════════ */
function LogoutButton({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    try {
      await fetchJson<AdminOkResponse>('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      /* 실패해도 로컬 상태는 로그아웃 처리(쿠키는 서버가 만료) */
    } finally {
      onDone();
    }
  };
  return (
    <button type="button" className="ver" style={{ cursor: 'pointer' }} onClick={logout} disabled={busy}>
      {busy ? '로그아웃 중…' : '로그아웃'}
    </button>
  );
}

/* ══════════════════ 로그인 게이트 ══════════════════ */
function LoginGate({ onAuthed }: { onAuthed: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      await fetchJson<AdminOkResponse>('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });
      onAuthed();
    } catch (err) {
      // 401(INVALID_CREDENTIALS) → 고정 안내. 그 외 → 계약 메시지/폴백.
      if (err instanceof ApiRequestError && err.status === 401) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (err instanceof ApiRequestError) {
        setError(err.apiError.message);
      } else {
        setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
      setPassword(''); // 비밀번호만 초기화(아이디는 유지)
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="eyebrow">ADMIN LOGIN</div>
      <h2 className="sec">관리자 로그인</h2>
      <p className="sec-sub">콘텐츠 관리·DB 초기화는 관리자 인증 후 사용할 수 있습니다.</p>

      <form onSubmit={submit} noValidate>
        <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          <label htmlFor="admin-username" style={labelStyle}>아이디</label>
          <input
            id="admin-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
            required
            disabled={busy}
          />
        </div>
        <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          <label htmlFor="admin-password" style={labelStyle}>비밀번호</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            disabled={busy}
          />
        </div>

        {error && (
          <div role="alert" aria-live="assertive" className="note"
            style={{ background: 'var(--red-soft)', color: 'var(--red-deep)', marginTop: 0, marginBottom: 12, fontWeight: 700 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? '확인 중…' : '로그인'}
        </button>
      </form>
    </section>
  );
}

/* ══════════════════ 대시보드 (인증됨) ══════════════════ */
function Dashboard({ onSessionExpired }: { onSessionExpired: () => void }) {
  return (
    <>
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

      <DangerZone onSessionExpired={onSessionExpired} />
    </>
  );
}

/* ══════════════════ 위험 구역 · DB 초기화 ══════════════════ */
function DangerZone({ onSessionExpired }: { onSessionExpired: () => void }) {
  const [step, setStep] = useState<'idle' | 'confirm'>('idle');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<AdminResetResponse['deleted'] | null>(null);

  const canExecute = confirmText.trim() === '삭제' && !busy;

  const reset = useCallback(() => {
    setStep('idle');
    setConfirmText('');
    setError(null);
  }, []);

  const execute = async () => {
    if (!canExecute) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetchJson<AdminResetResponse>('/api/admin/reset', {
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ confirm: 'DELETE_ALL' }),
      });
      setDone(res.deleted);
      setStep('idle');
      setConfirmText('');
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        // ADMIN_UNAUTHORIZED — 세션 만료 → 로그인 게이트로.
        setError('세션이 만료되었습니다. 다시 로그인하세요.');
        onSessionExpired();
      } else if (err instanceof ApiRequestError) {
        setError(err.apiError.message);
      } else {
        setError('초기화 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card" style={{ border: '1.5px solid var(--red)', marginTop: 8 }}>
      <div className="eyebrow" style={{ color: 'var(--red-deep)' }}>DANGER ZONE</div>
      <h2 className="sec">위험 구역 · DB 초기화</h2>
      <p className="sec-sub">
        이 작업은 되돌릴 수 없습니다. 모든 검사 세션·응답·채점 결과가 영구 삭제됩니다.
        (문항·콘텐츠·계정은 삭제되지 않습니다.)
      </p>

      {done && (
        <div role="status" aria-live="polite" className="note"
          style={{ background: 'var(--pine-soft)', color: 'var(--pine-deep)', fontWeight: 700 }}>
          삭제 완료 — 검사 {done.sessions} · 응답 {done.responses} · 결과 {done.results}건 삭제됨.
        </div>
      )}

      {error && (
        <div role="alert" aria-live="assertive" className="note"
          style={{ background: 'var(--red-soft)', color: 'var(--red-deep)', fontWeight: 700 }}>
          {error}
        </div>
      )}

      {step === 'idle' ? (
        <button type="button" className="btn btn-danger" style={{ marginTop: 14 }} onClick={() => { setDone(null); setError(null); setStep('confirm'); }}>
          DB 초기화
        </button>
      ) : (
        <div style={{ marginTop: 14, border: '1.5px dashed var(--red)', borderRadius: 12, padding: 16, background: 'var(--red-soft)' }}>
          <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--red-deep)', marginBottom: 10 }}>
            최종 확인 — 계속하려면 아래 칸에 <b>삭제</b> 를 정확히 입력하세요.
          </p>
          <div style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
            <label htmlFor="reset-confirm" style={labelStyle}>확인 문구</label>
            <input
              id="reset-confirm"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="삭제"
              style={inputStyle}
              disabled={busy}
              aria-describedby="reset-help"
            />
            <span id="reset-help" style={{ fontSize: '.72rem', color: 'var(--sub)' }}>
              정확히 “삭제” 두 글자를 입력해야 실행 버튼이 활성화됩니다.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-danger" onClick={execute} disabled={!canExecute}>
              {busy ? '삭제 중…' : '영구 삭제 실행'}
            </button>
            <button type="button" className="btn" onClick={reset} disabled={busy}>
              취소
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
