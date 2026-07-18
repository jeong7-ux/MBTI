'use client';
/**
 * 로컬 백업 · 유실 방지 (F-04, PRD §9).
 * - IndexedDB에 세션별 응답을 실시간 백업(오프라인/새로고침 내성).
 * - 서버 저장 실패분은 로컬 큐에 남겨 재전송.
 * - 버전 선택 등 경량 선호는 localStorage.
 * SSR 안전: 모든 접근은 브라우저 환경 가드.
 */
import type { AnswerInput, Choice, Product, AvatarVersion } from '@contract';

const isBrowser = typeof window !== 'undefined';

/* ── localStorage 경량 선호 ── */
const LS_VERSION = 'mt.avatarVersion';
const LS_PRODUCT = 'mt.product';
const LS_LAST_RESUME = 'mt.lastResumeToken';

export function saveVersionPref(v: AvatarVersion) { if (isBrowser) localStorage.setItem(LS_VERSION, v); }
export function loadVersionPref(): AvatarVersion | null {
  if (!isBrowser) return null;
  const v = localStorage.getItem(LS_VERSION);
  return v === 'M' || v === 'F' ? v : null;
}
export function saveProductPref(p: Product) { if (isBrowser) localStorage.setItem(LS_PRODUCT, p); }
export function loadProductPref(): Product | null {
  if (!isBrowser) return null;
  const p = localStorage.getItem(LS_PRODUCT);
  return p === 'basic' || p === 'standard' || p === 'pro' ? p : null;
}
export function saveLastResume(token: string) { if (isBrowser) localStorage.setItem(LS_LAST_RESUME, token); }
export function loadLastResume(): string | null { return isBrowser ? localStorage.getItem(LS_LAST_RESUME) : null; }
export function clearLastResume() { if (isBrowser) localStorage.removeItem(LS_LAST_RESUME); }

/* ── IndexedDB 응답 백업 ── */
const DB_NAME = 'mindtype';
const STORE = 'answers'; // key: `${sessionId}:${questionId}`
const QUEUE = 'queue';   // 서버 미반영 재전송 큐

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser || !('indexedDB' in window)) { reject(new Error('no-idb')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains(QUEUE)) db.createObjectStore(QUEUE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface StoredAnswer extends AnswerInput { savedAt: number; synced: boolean; }

/** 응답 로컬 백업(즉시). 서버 실패 시 synced=false로 큐에 남김. */
export async function backupAnswer(sessionId: string, questionId: string, choice: Choice, synced: boolean, elapsedMs?: number): Promise<void> {
  if (!isBrowser) return;
  const rec: StoredAnswer = { questionId, choice, elapsedMs, savedAt: Date.now(), synced };
  try {
    await withStore(STORE, 'readwrite', (s) => s.put(rec, `${sessionId}:${questionId}`));
    if (!synced) await withStore(QUEUE, 'readwrite', (s) => s.put(rec, `${sessionId}:${questionId}`));
    else await withStore(QUEUE, 'readwrite', (s) => s.delete(`${sessionId}:${questionId}`));
  } catch { /* IDB 미지원 환경은 무시(서버 저장이 진실원천) */ }
}

/** 세션의 로컬 백업 응답 전체 로드(재개 시 병합용). */
export async function loadAnswers(sessionId: string): Promise<Record<string, StoredAnswer>> {
  if (!isBrowser) return {};
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const out: Record<string, StoredAnswer> = {};
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).openCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (!cur) { resolve(out); return; }
        const key = String(cur.key);
        if (key.startsWith(`${sessionId}:`)) out[key.split(':')[1]] = cur.value as StoredAnswer;
        cur.continue();
      };
      req.onerror = () => reject(req.error);
    });
  } catch { return {}; }
}

/** 재전송 큐(서버 미반영) 로드. */
export async function loadQueue(sessionId: string): Promise<AnswerInput[]> {
  if (!isBrowser) return [];
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const out: AnswerInput[] = [];
      const tx = db.transaction(QUEUE, 'readonly');
      const req = tx.objectStore(QUEUE).openCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (!cur) { resolve(out); return; }
        if (String(cur.key).startsWith(`${sessionId}:`)) {
          const v = cur.value as StoredAnswer;
          out.push({ questionId: v.questionId, choice: v.choice, elapsedMs: v.elapsedMs });
        }
        cur.continue();
      };
      req.onerror = () => reject(req.error);
    });
  } catch { return []; }
}
