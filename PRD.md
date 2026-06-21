# 🌸 Bloom MBTI — Product Requirements Document (PRD)

> **Bloom Personality Test**
> 여성들을 위한 감성적인 UI/UX와 DB-less 공유 아키텍처 기반 MBTI 검사 서비스

| 항목 | 내용 |
|---|---|
| **문서 버전** | v1.0 (DB-less) |
| **작성일** | 2026-06-21 |
| **플랫폼** | Web (Mobile-First Responsive) |
| **호스팅** | GitHub Pages (Static Hosting) |
| **타겟 사용자** | 트렌디한 디자인과 심미적 만족을 중시하는 20-30대 여성 |
| **비전** | "가장 나다운 모습을 기록하고, 서버 없이도 온전히 공유하는 프라이빗 웰니스 가이드" |

---

## 1. Problem Statement & Goals

### 1.1 배경 및 Pain Points
1. **과도한 개인정보 요구**: 기존의 MBTI 서비스들은 결과를 기록하고 공유하기 위해 회원가입을 유도하거나 민감한 정보를 DB에 수집하여 사용자의 심리적 허들이 높습니다.
2. **복잡하고 유행이 지난 UI**: 딱딱한 라디오 버튼, 지루한 텍스트 나열로 인해 검사 도중 이탈률이 높습니다. 
3. **불편한 공유 방식**: 스크린샷 캡처 시 화면 비율이 깨지거나, 링크 공유 시 상대방이 내 결과를 한눈에 매끄럽게 보기 어렵습니다.

### 1.2 솔루션 및 목표 (GitHub Pages 최적화)
- **Zero-DB Architecture**: 서버와 데이터베이스 없이 **localStorage**와 **URL Query Parameter**만을 사용하여 데이터를 완벽히 독립적으로 관리하고 공유합니다.
- **Instagram-ready Card Export**: HTML5 Canvas를 활용하여 사용자가 캡처 도구 없이 원탭으로 정갈하고 예쁜 결과 카드를 저장할 수 있도록 지원합니다.
- **Liquid Bloom Design**: 2026년 트렌드인 Liquid Glass(글래스모피즘 2.0), 부드러운 그라디언트, 쫀득한 마이크로 애니메이션을 통해 감성적인 몰입감을 제공합니다.

---

## 2. Core Features (핵심 기능 스펙)

### 2.1 🏠 Intro Page (진입 및 사용자 식별)
- **닉네임 입력**: 비회원 기반 서비스이므로 결과를 커스텀 카드에 입히기 위한 닉네임(최대 8자)을 입력받습니다.
- **인터랙티브 스플래시**: 파스텔 그라디언트와 미세하게 움직이는 비정형 유기체(blob) 효과로 첫인상 제공.

### 2.2 📝 Test Page (MBTI 테스트 수행)
- **12문항 슬라이드형 질문지**: 이탈률 최소화를 위해 12개의 직관적이고 몰입감 높은 질문(E/I, S/N, T/F, J/P 각 3문항)으로 구성.
- **카드 스와이프/탭 액션**: 질문 선택 시 다음 카드가 부드럽게 밀려오며, 선택 버튼은 누를 때 스프링처럼 쫀득하게 튀어 오르는(Squishy) 인터랙션 적용.
- **상태 게이지**: 상단에 꽃이 피어나는 모티브의 프로그레스 바 제공.

### 2.3 📊 Result Page (결과 분석 및 공유)
- **Bento Box 레이아웃**: 분석 내용을 여러 조각의 깔끔한 유리 카드(Bento Grid)로 구획화하여 표현.
  - 카드 1: MBTI 유형 명칭 및 메인 키워드 일러스트
  - 카드 2: 유형별 4대 성격 성향 게이지 (E vs I 등)
  - 카드 3: "나를 설명하는 키워드 5가지" (해시태그)
  - 카드 4: 나에게 맞는 웰니스/마인드풀니스 꿀팁 3가지
- **Client-Side Canvas Export**: 결과 데이터를 HTML Canvas에 투영하여 SNS 업로드용 세로형 카드 이미지(1080x1920)를 생성 및 다운로드하는 버튼 제공.
- **URL Parameter 기반 공유**: 
  - 공유 버튼 클릭 시, `?n=[닉네임]&t=[유형]&s=[스코어데이터]`가 합쳐진 인코딩된 URL이 클립보드에 복사됨.
  - 타인이 해당 URL로 접속 시, Intro를 건너뛰고 해당 파라미터를 해독하여 동일한 **Bento Box 결과 페이지**를 재현함. "나도 테스트하기" 버튼을 하단에 제공하여 바이럴 유도.

---

## 3. UI/UX 디자인 시스템: "Liquid Bloom"

### 3.1 컬러 시스템 (Soft & Luminous)
- **Primary Brand**: `#FF5C8D` (Dawn Pink / HSL 340, 100%, 68%)
- **Sub Brand**: `#B8A3E8` (Soft Lavender) & `#86DBAA` (Sage Green)
- **Glass Base (Background)**: `rgba(255, 255, 255, 0.65)` (Blur: 20px)
- **Border**: `rgba(255, 255, 255, 0.3)`
- **Text Primary**: `#1A1A2E` (Deep Indigo)
- **Background Gradient**: `linear-gradient(135deg, #FFF5F7 0%, #FFE4EB 50%, #F5F0FF 100%)` (부드러운 크로스페이드)

### 3.2 타이포그래피
- **Title (영문)**: `Outfit` Font (둥글둥글하고 모던한 서체)
- **Body (국문)**: `Pretendard Variable` (가독성과 부드러움을 갖춘 서체)

---

## 4. DB-less 아키텍처 및 데이터 흐름

### 4.1 URL 공유 데이터 구조 (Serialization)
URL 길이를 최소화하기 위해 바이너리화 또는 단축 키 매핑을 사용합니다.
- `n`: Nickname (String, URI Encoded)
- `t`: MBTI Type (String, 4글자, 예: `INFP`)
- `s`: 4대 차원 스코어 (0-100 사이 정수 4개, 콤마 분할, 예: `30,70,80,40`)

**공유 링크 예시:**
`https://username.github.io/bloom-mbti/#/result?n=Jane&t=INFP&s=30,70,80,40`

### 4.2 로컬 저장 흐름
1. 테스트 완료 시, 브라우저 `localStorage`에 최근 검사 결과 저장:
   ```json
   {
     "lastTested": "2026-06-21T12:00:00Z",
     "nickname": "Jane",
     "type": "INFP",
     "scores": [30, 70, 80, 40]
   }
   ```
2. 다시 방문 시 기존 결과를 볼 수 있는 버튼 활성화.

---

## 5. 성공 지표 (Static App 특화)
- **인클로저율 (완료율)**: Intro 페이지 진입 대비 결과 페이지 도달 비율 80% 이상 목표.
- **공유 바이럴 계수**: URL 공유 링크 생성 클릭률 30% 이상.
- **이미지 다운로드 수**: 결과 저장 이미지 다운로드 버튼 클릭률 25% 이상.
