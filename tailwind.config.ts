import type { Config } from 'tailwindcss';

/**
 * 디자인 토큰 성문화 — 표준양식 :root 값을 Tailwind theme로 이식.
 * CSS 변수를 단일 소스로 두고 Tailwind는 var()를 참조(값 이중정의 방지).
 * 출처: _workspace/01_designer_design-system.md §1
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        ink: 'var(--ink)',
        sub: 'var(--sub)',
        line: 'var(--line)',
        pine: { DEFAULT: 'var(--pine)', deep: 'var(--pine-deep)', soft: 'var(--pine-soft)' },
        amber: { DEFAULT: 'var(--amber)', soft: 'var(--amber-soft)' },
        red: { DEFAULT: 'var(--red)', soft: 'var(--red-soft)' },
        blue: { DEFAULT: 'var(--blue)', soft: 'var(--blue-soft)' },
        slot: { DEFAULT: 'var(--slot)', line: 'var(--slot-line)' },
        // 기질 4그룹 — 면/막대 배경 전용(텍스트 색 금지)
        'temp-nt': { DEFAULT: 'var(--temp-nt)', tint: 'var(--temp-nt-tint)' },
        'temp-nf': { DEFAULT: 'var(--temp-nf)', tint: 'var(--temp-nf-tint)' },
        'temp-sj': { DEFAULT: 'var(--temp-sj)', tint: 'var(--temp-sj-tint)' },
        'temp-sp': { DEFAULT: 'var(--temp-sp)', tint: 'var(--temp-sp-tint)' },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', 'sans-serif'],
        mono: ['ui-monospace', 'Cascadia Code', 'JetBrains Mono', 'D2Coding', 'Consolas', 'monospace'],
      },
      borderRadius: {
        // 라운드 위계 (SHAPE CONSISTENCY LOCK)
        card: '20px',
        blk: '16px',
        sm: '12px',
        slot: '10px',
        char: '36px',
      },
      borderWidth: { '1.5': '1.5px' },
      boxShadow: { card: 'var(--shadow)' },
      maxWidth: { report: '880px', wide: '1120px' },
    },
  },
  plugins: [],
};

export default config;
