export interface Answer {
  text: string;
  value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  score: number; // 0 to 100 representing strength
}

export interface Question {
  id: number;
  text: string;
  category: 'EI' | 'SN' | 'TF' | 'JP';
  answers: [Answer, Answer];
}

export interface UserResult {
  nickname: string;
  type: string; // e.g. "INFP"
  scores: number[]; // [E_score, N_score, F_score, P_score] (0 to 100)
}

export interface MBTIDetails {
  title: string;
  subTitle: string;
  emoji: string;
  tags: string[];
  description: string;
  wellnessTips: string[];
  color: {
    from: string;
    to: string;
    text: string;
  };
}

// 12 Emotional & Relatable Questions
export const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'EI',
    text: '주말 아침, 햇살을 보며 눈을 떴을 때 내가 드는 생각은?',
    answers: [
      { text: '오늘 어디 좋은 곳 가볼까? 친구들에게 얼른 톡해봐야지! ☕', value: 'E', score: 100 },
      { text: '포근한 이불 속이 최고야. 오늘은 혼자만의 홈카페 오픈 📖', value: 'I', score: 100 }
    ]
  },
  {
    id: 2,
    category: 'SN',
    text: '마음에 쏙 드는 향수를 골랐을 때 나의 첫인상은?',
    answers: [
      { text: '은은한 우디 향이 가을바람과 잘 어울릴 것 같아 🍂', value: 'S', score: 100 },
      { text: '마치 노을 지는 숲속 한가운데 외로이 서 있는 듯한 느낌이야 🌌', value: 'N', score: 100 }
    ]
  },
  {
    id: 3,
    category: 'TF',
    text: '친구가 "나 요새 너무 우울해서 홧김에 립스틱 질렀어"라고 할 때 내 반응은?',
    answers: [
      { text: '헐 무슨 일 있어? 왜 우울해ㅠㅠ 기분은 좀 풀렸어? 🥺', value: 'F', score: 100 },
      { text: '어떤 컬러 샀어? 기분전환엔 쇼핑이 직빵이긴 하지 💄', value: 'T', score: 100 }
    ]
  },
  {
    id: 4,
    category: 'JP',
    text: '쉬는 날, 카페에 가기 전에 나의 움직임은?',
    answers: [
      { text: '가고 싶은 카페 영업시간과 시그니처 메뉴, 동선을 미리 파악한다 🗺️', value: 'J', score: 100 },
      { text: '일단 나간 뒤, 예뻐 보이는 골목길을 걷다 맘에 드는 곳으로 쏙 들어간다 🌿', value: 'P', score: 100 }
    ]
  },
  {
    id: 5,
    category: 'EI',
    text: '지치고 힘든 하루를 보낸 후, 내가 에너지를 충전하는 공간은?',
    answers: [
      { text: '북적이는 핫플에서 사람들의 생기를 느끼며 수다 떨기 🍹', value: 'E', score: 100 },
      { text: '따뜻한 물로 스파하고 방안에 은은하게 인센스 스틱 켜두기 🛀', value: 'I', score: 100 }
    ]
  },
  {
    id: 6,
    category: 'SN',
    text: '스킨케어를 바르며 거울 속 내 모습을 볼 때 머릿속은?',
    answers: [
      { text: '피부 결이 촉촉해졌네. 내일 아침 화장이 잘 먹겠다 ✨', value: 'S', score: 100 },
      { text: '우리는 나이가 들어감에 따라 매일 어떻게 성숙해지는 걸까? 🕰️', value: 'N', score: 100 }
    ]
  },
  {
    id: 7,
    category: 'TF',
    text: '연인과 다툰 후 화해할 때, 나에게 가장 와닿는 사과는?',
    answers: [
      { text: '속상하게 해서 미안해. 내 말이 네 마음에 상처가 됐을 텐데.. 🥺', value: 'F', score: 100 },
      { text: '내가 오해해서 잘못 행동했어. 다음부터는 어떻게 고칠게 📝', value: 'T', score: 100 }
    ]
  },
  {
    id: 8,
    category: 'JP',
    text: '방 청소를 할 때 나의 정리 정돈 스타일은?',
    answers: [
      { text: '오브제들의 위치와 옷장 서랍 칸마다 완벽한 규칙이 있다 🧺', value: 'J', score: 100 },
      { text: '흐트러진 대로 둔 자연스러운 네추럴 무드가 감성적이고 편하다 🕯️', value: 'P', score: 100 }
    ]
  },
  {
    id: 9,
    category: 'EI',
    text: '새로운 웰니스 원데이 클래스(요가/명상)에 참가했을 때 나는?',
    answers: [
      { text: '옆자리 분에게 먼저 인사하며 자연스럽게 말을 건넨다 👋', value: 'E', score: 100 },
      { text: '선생님의 말과 내 호흡에 온전히 집중하며 조용히 수업에 몰입한다 🧘', value: 'I', score: 100 }
    ]
  },
  {
    id: 10,
    category: 'SN',
    text: '밤하늘에 동그란 보름달이 환하게 뜬 것을 보았을 때 나는?',
    answers: [
      { text: '달이 엄청 밝고 예쁘네. 사진 찍어서 스토리에 올려야지 📸', value: 'S', score: 100 },
      { text: '달나라에는 정말 외계인이 살까? 나도 우주선을 타고 날아가고 싶어 🚀', value: 'N', score: 100 }
    ]
  },
  {
    id: 11,
    category: 'TF',
    text: '친구의 새로운 헤어스타일이 어색해 보일 때 나의 생각은?',
    answers: [
      { text: '머리 자르느라 돈도 들고 기분전환 하고 싶었을 텐데, 예쁘다고 해줘야지 💕', value: 'F', score: 100 },
      { text: '스타일 변화를 주었구나. 전 머리가 좀 더 잘 어울렸던 것 같긴 한데.. 🤔', value: 'T', score: 100 }
    ]
  },
  {
    id: 12,
    category: 'JP',
    text: '여행용 캐리어를 챙길 때 나의 짐 싸기 방식은?',
    answers: [
      { text: '날짜별 룩북 코디와 뷰티 파우치를 리스트업해서 꼼꼼히 정리한다 💼', value: 'J', score: 100 },
      { text: '일단 필요해 보이는 건 다 집어넣고 부족한 건 가서 사서 쓴다 🎒', value: 'P', score: 100 }
    ]
  }
];

// 16 MBTI details curated for Women's Lifestyle and Wellness
export const MBTI_DETAILS: Record<string, MBTIDetails> = {
  ENFP: {
    title: '햇살 가득 머금은 스파클링 피치 🍑',
    subTitle: '자유로운 영혼의 활동가 (ENFP)',
    emoji: '✨',
    tags: ['#러블리', '#호기심대왕', '#인간비타민', '#아이디어뱅크', '#즉흥여행'],
    description: '매사 열정적이고 상상력이 풍부한 당신은 주변 사람들에게 밝고 긍정적인 에너지를 전파하는 존재입니다. 새로운 자극과 성장을 좋아하며, 감정 표현에 솔직하고 다정합니다.',
    wellnessTips: [
      '생각이 꼬리를 물어 불면증에 걸리기 쉬우니 밤에는 아로마 오일로 발 마사지를 해보세요.',
      '일기를 쓰며 산발적인 아이디어와 감정을 한곳에 정돈하는 시간을 가지는 것이 좋습니다.',
      '피부 장벽 강화를 위해 세라마이드 성분이 듬뿍 든 크림으로 마사지 루틴을 추가하세요.'
    ],
    color: { from: '#FF9E7D', to: '#FF769F', text: '#FFE4EB' }
  },
  INFP: {
    title: '은은한 달빛 아래 라벤더 숲 🌌',
    subTitle: '열정적인 중재자 (INFP)',
    emoji: '🕯️',
    tags: ['#감성충만', '#프라이빗다이어리', '#깊은생각', '#나만의아지트', '#따뜻한마음'],
    description: '누구보다 따뜻하고 이상주의적인 마음을 가진 당신은 자신만의 낭만 가득한 세계 속에서 글을 쓰거나 예술을 즐깁니다. 타인의 슬픔에 깊이 공감하고 배려하는 섬세함을 지녔습니다.',
    wellnessTips: [
      '하루에 15분씩, 잔잔한 백색소음이나 로파이(Lo-Fi) 음악을 들으며 싱잉볼 명상을 해보세요.',
      '피부가 감정 변화에 예민하게 반응할 수 있으니 진정 효과가 탁월한 티트리나 시카 토너팩을 추천합니다.',
      '생각이 많아 머리가 복잡할 땐 따뜻한 티(Tea)를 마시며 온전한 쉼표를 그려보세요.'
    ],
    color: { from: '#B8A3E8', to: '#7C5CC5', text: '#ECE1FF' }
  },
  ENFJ: {
    title: '온실 속 활짝 핀 클래식 로즈 🌹',
    subTitle: '정의로운 사회운동가 (ENFJ)',
    emoji: '💞',
    tags: ['#다정다감', '#천사리더', '#소통의여왕', '#타인공감', '#스위트홈'],
    description: '주변 사람들을 챙기고 보살피는 데에서 가장 큰 기쁨을 느끼는 배려 깊은 당신. 타인의 성장 가능성을 돕고, 선한 영향력을 전파하기 위해 끊임없이 움직이는 아름다운 조력자입니다.',
    wellnessTips: [
      '타인을 챙기느라 자신의 번아웃을 놓치기 쉽습니다. 주 1회는 전자기기를 끄는 디지털 디톡스를 실천하세요.',
      '목과 어깨가 긴장되기 쉬우니 승모근을 풀어주는 스트레칭과 로즈마리 괄사 마사지를 권장합니다.',
      '피부 탄력 케어를 위해 콜라겐 성분의 스킨케어로 밤샘 활력을 가꿔보세요.'
    ],
    color: { from: '#FF7DA8', to: '#E8366D', text: '#FFE4EB' }
  },
  INFJ: {
    title: '아침이슬을 맞이하는 새벽 안개 🌫️',
    subTitle: '선의의 옹호자 (INFJ)',
    emoji: '🧘',
    tags: ['#신비로움', '#생각깊은스님', '#영혼의동반자', '#나만의우주', '#정성어린글'],
    description: '조용하면서도 강한 신념을 가진 당신은 삶의 깊은 의미와 영혼의 소통을 지향합니다. 겉으로는 조용하지만 속은 깊은 물결처럼 끊임없이 흘러가며, 직관적으로 상황을 읽어내는 능력이 뛰어납니다.',
    wellnessTips: [
      '일기를 손으로 직접 쓰는 아날로그 저널링을 통해 복잡한 내면을 단순화시켜보세요.',
      '수면이 보약입니다. 숙면을 위해 암막 커튼을 설치하고, 자기 전 라벤더 룸 스프레이를 뿌려주세요.',
      '민감한 피부를 위해 저자극 약산성 클렌저와 가벼운 보습 위주의 스키니멀리즘 루틴을 유지하세요.'
    ],
    color: { from: '#A3B3E8', to: '#5C6BC5', text: '#ECE1FF' }
  },

  ESTP: {
    title: '톡 쏘는 레몬 라임 탄산수 🍋',
    subTitle: '모험을 즐기는 사업가 (ESTP)',
    emoji: '⚡',
    tags: ['#에너제틱', '#걸크러쉬', '#스릴만점', '#트렌드세터', '#시원시원'],
    description: '어떤 상황에서도 주눅 들지 않고 문제를 시원하게 해결해 나가는 에너지 넘치는 개척자입니다. 트렌드에 무척 예민하고 활동적이며, 직접 몸으로 부딪쳐 경험하고 즐기는 인생을 사랑합니다.',
    wellnessTips: [
      '다이내믹한 고강도 인터벌 운동(HIIT)이나 줌바 댄스로 일상의 도파민과 에너지를 해소하세요.',
      '활동량이 많아 땀 노폐물이 쌓이기 쉬우니 모공 딥클렌징 클레이 팩을 주 2회 실천하세요.',
      '가벼운 오일 프리 워터 에센스로 산뜻하고 빠른 수분 충전막을 형성해 주는 것이 좋습니다.'
    ],
    color: { from: '#FFE07D', to: '#FFA000', text: '#FFF8F0' }
  },
  ISTP: {
    title: '차갑고 매끄러운 쿨 민트 토너 ❄️',
    subTitle: '만능 재주꾼 (ISTP)',
    emoji: '🛠️',
    tags: ['#쿨뷰티', '#혼자서도척척', '#미니멀라이프', '#자유주의', '#시크함'],
    description: '상황 판단력이 빠르고 도구를 능숙하게 다루는 쿨한 해결사입니다. 말수가 적고 냉철해 보이지만 관찰력이 예리하며, 불필요한 일에 에너지를 낭비하지 않는 미니멀한 라이프스타일을 추구합니다.',
    wellnessTips: [
      '스킨케어 단계를 과감히 줄인 "스키니멀리즘"을 실천하세요. 올인원 고효능 세럼이 잘 맞습니다.',
      '혼자 조용히 조립하거나 그림을 그리는 창작 활동이 마인드 컨트롤에 큰 도움을 줍니다.',
      '스트레스 완화를 위해 페퍼민트 에센셜 오일을 관자놀이에 발라 쿨링감을 전하세요.'
    ],
    color: { from: '#80DEEA', to: '#00ACC1', text: '#E0F7FA' }
  },
  ESFP: {
    title: '오색 펄이 반짝이는 핑크 글리터 ✨',
    subTitle: '자유로운 영혼의 연예인 (ESFP)',
    emoji: '🎈',
    tags: ['#분위기메이커', '#파티퀸', '#오늘을살아라', '#쇼핑홀릭', '#공감백배'],
    description: '매력적이고 생기 넘치는 에너지로 어디를 가든 스포트라이트를 받는 분위기 메이커입니다. 지금 이 순간의 행복을 만끽하며, 주변 사람들과 예쁜 것을 공유하고 웃는 것을 삶의 원동력으로 삼습니다.',
    wellnessTips: [
      '사람들과 함께 에너지를 내는 댄스, 페스티벌 참가 또는 스파 파티를 기획해보세요.',
      '피부 톤업과 투명한 광채를 위해 비타민 C 앰플을 바르고 쿨링 롤러 마사지를 함께 하세요.',
      '충동적 지출로 속상하지 않게 예산을 미리 짜두는 스마트 쇼핑 습관이 웰니스의 시작입니다.'
    ],
    color: { from: '#FFA7C4', to: '#FF4081', text: '#FFE4EB' }
  },
  ISFP: {
    title: '어스름한 노을 빛 파스텔 캔버스 🎨',
    subTitle: '호기심 많은 예술가 (ISFP)',
    emoji: '🎨',
    tags: ['#예술적무드', '#평화주의자', '#감성홈데코', '#부드러움', '#다정함'],
    description: '갈등을 싫어하고 다정다감하며, 자연과 예술을 온 내면으로 호흡하는 조용한 예술가입니다. 자신의 감정과 가치를 공간이나 글, 패션에 잔잔하고 예쁘게 투영하는 뛰어난 안목을 갖고 있습니다.',
    wellnessTips: [
      '방에 따뜻한 조명과 우드 감성의 소품을 더해 나만의 힐링 인테리어를 꾸며 마음을 충전하세요.',
      '자극에 연동되기 쉬운 민감성 피부를 위해 병풀 추출물 성분의 순한 패드 팩을 활용해 보세요.',
      '조용한 숲속길 걷기나 해 질 녘 노을 산책을 통해 예술적 영감과 마음의 안정을 찾으세요.'
    ],
    color: { from: '#FFD54F', to: '#F57C00', text: '#FFF8F0' }
  },
  ESTJ: {
    title: '질서 정연하게 깎인 에메랄드 크리스탈 💎',
    subTitle: '엄격한 관리자 (ESTJ)',
    emoji: '🎖️',
    tags: ['#자기관리끝판왕', '#시간표요정', '#성과주의', '#리얼팩트', '#쿨크러쉬'],
    description: '체계와 일의 끝맺음을 중시하며, 한 치의 오차 없이 하루를 쪼개어 사는 갓생의 대명사입니다. 흐트러짐 없는 모습과 신뢰성 있는 일 처리로 모든 모임에서 든든한 캡틴 역할을 맡곤 합니다.',
    wellnessTips: [
      '피로 해소와 림프 순환을 돕기 위해 반신욕 시 사과식초나 시트러스 배스 솔트를 사용해 보세요.',
      '스킨케어에 에이징 케어 레티놀 제품을 도입해 체계적인 슬로우 에이징 루틴을 시작해보세요.',
      '하루에 30분씩은 핸드폰을 완전히 끄고 차분히 차를 우리는 다도 시간을 갖는 것이 좋습니다.'
    ],
    color: { from: '#A5D6A7', to: '#2E7D32', text: '#E8F5E9' }
  },
  ISTJ: {
    title: '잘 말려 책갈피에 끼워둔 라벤더 잎 🌿',
    subTitle: '청렴결백한 공무원 (ISTJ)',
    emoji: '🏛️',
    tags: ['#조용한성실함', '#깔끔수납', '#나만의질서', '#안정감', '#시간엄수'],
    description: '조용히 약속을 지키고, 모든 소품이 제자리에 위치해야 편안함을 느끼는 단정함의 정석입니다. 화려하지는 않지만 은은하게 신뢰의 향을 풍기며, 언제나 차분하고 꼼꼼하게 자신의 세상을 조율합니다.',
    wellnessTips: [
      '발바닥 마사지와 폼롤러를 이용해 하루 동안 쌓인 신체적 피로를 저녁마다 시원하게 밀어내세요.',
      '피부 장벽을 보호해 줄 수 있는 끈적임 없는 보습 장벽 세라마이드 보습제를 꼼꼼히 덧바르세요.',
      '매주 일요일 저녁 한 주간의 일정을 일목요연하게 플래너에 다이어리로 수납해두세요.'
    ],
    color: { from: '#B0BEC5', to: '#37474F', text: '#ECEFF1' }
  },
  ENTP: {
    title: '스파크가 튀는 레몬 라벤더 마티니 🍸',
    subTitle: '뜨거운 논쟁을 즐기는 변론가 (ENTP)',
    emoji: '🔮',
    tags: ['#천재만재', '#말빨의여왕', '#지적자극', '#자기애최고', '#신선함'],
    description: '언제나 유쾌하고 똑똑한 입담으로 사람들의 지적 호기심을 유발하는 당신. 관습에 도전하고 새로운 트렌드를 비틀어 해석하며, 독창적인 아이디어와 에너지가 끝없이 솟구칩니다.',
    wellnessTips: [
      '밤새도록 아이디어 검색으로 스마트폰을 보기 쉬우니, 11시 이후 스마트폰 블루라이트 차단 앱을 꼭 켜세요.',
      '피부 부기를 빠르게 가라앉혀주는 아이스 쿨러와 카페인 팩으로 생기 있는 모닝 스킨 루틴을 만드세요.',
      '새로운 취미를 여러 개 시작하며 에너지를 분출하는 퓨전 운동 클래스를 등록해 보세요.'
    ],
    color: { from: '#CE93D8', to: '#6A1B9A', text: '#F3E5F5' }
  },
  INTP: {
    title: '차분한 실버 라벤더 티 에센스 🧪',
    subTitle: '아이디어 작가 (INTP)',
    emoji: '🔬',
    tags: ['#호기심가득', '#조용한천재', '#논리왕', '#팩트체크', '#혼자놀기만렙'],
    description: '조용히 세상을 관찰하며 원리와 본질을 분석해 나가는 지적인 탐구가입니다. 생각의 깊이가 깊어 깊은 숲속의 고요함을 닮았으며, 객관적이고 편견 없는 따뜻한 지성미를 지니고 있습니다.',
    wellnessTips: [
      '피부 순환과 노폐물 배출을 돕기 위해 따뜻한 녹차 팩 또는 쑥 족욕을 통해 몸의 온도를 높여주세요.',
      '머리가 너무 지쳤을 땐 자연 속으로 떠나는 숲 테라피나 맨발 걷기를 통해 뇌를 쉬게 해주세요.',
      '어 성분 기능성 설명서를 읽으며 스킨케어 화학 작용을 분석하는 즐거움을 화장품 루틴에 적용하세요.'
    ],
    color: { from: '#B2DFDB', to: '#00695C', text: '#E0F2F1' }
  },
  ENTJ: {
    title: '진하고 묵직한 카카오 골드 바 🍫',
    subTitle: '대담한 지도자 (ENTJ)',
    emoji: '👑',
    tags: ['#여공남수', '#야망가', '#걸크러쉬끝판왕', '#완벽주의리더', '#체계적성장'],
    description: '탁월한 장기적 안목과 리더십으로 목표한 고지를 향해 당당하게 걸어가는 카리스마 리더입니다. 사람들에게 비전을 제시하고, 어떤 시련도 전략적으로 해결해 나가는 힘찬 에너지를 가지고 있습니다.',
    wellnessTips: [
      '높은 목표 스트레스로 두통이나 턱 관절 장애가 생길 수 있으니 턱 근육 괄사 마사지와 스트레칭을 잊지 마세요.',
      '레티놀과 펩타이드 등의 안티에이징 고기능성 성분으로 피부에 확실한 영양 에너지를 주입하세요.',
      '주말에는 아무 생각 없이 몰두할 수 있는 수영이나 격투기, 등산 등으로 잡념을 시원하게 털어내세요.'
    ],
    color: { from: '#FFE082', to: '#FF8F00', text: '#FFF8F0' }
  },
  INTJ: {
    title: '차가운 딥 블루 사파이어 🌌',
    subTitle: '용의주도한 전략가 (INTJ)',
    emoji: '📡',
    tags: ['#냉철함', '#완벽주의아우라', '#독립심강함', '#지적능력', '#비밀정원'],
    description: '매우 독립적이고 분석적이며, 세상의 흐름을 한눈에 간파해 나만의 비밀 설계도를 그리는 전략가입니다. 사람들을 가볍게 대하기보다 소수의 소중한 관계에 온전히 집중하는 묵직함이 있습니다.',
    wellnessTips: [
      '생각 과부하로 두뇌 피로가 쉽게 쌓이니 하루 10분 온전한 마인드풀니스 정좌 명상을 해보세요.',
      '각질과 턴오버 주기를 맞춰주기 위해 AHA/BHA 성분의 각질 토너와 진정 에센스 믹스를 추천합니다.',
      '나만의 공간에서 인센스 스틱을 켜두고 명상 요가를 실행해 몸과 정신을 완전히 동기화하세요.'
    ],
    color: { from: '#9FA8DA', to: '#283593', text: '#E8EAF6' }
  }
};

// State-Based Serialization Utilities for URL sharing
export function serializeResult(nickname: string, type: string, scores: number[]): string {
  const data = {
    n: nickname,
    t: type,
    s: scores
  };
  const jsonStr = JSON.stringify(data);
  // Convert to Base64 (URL Safe)
  try {
    const base64 = btoa(encodeURIComponent(jsonStr));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (e) {
    console.error('Failed to serialize result:', e);
    return '';
  }
}

export function deserializeResult(hash: string): UserResult | null {
  try {
    // Restore base64 padding
    let base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(atob(base64));
    const data = JSON.parse(jsonStr);
    
    if (data.n && data.t && Array.isArray(data.s)) {
      return {
        nickname: data.n,
        type: data.t,
        scores: data.s
      };
    }
    return null;
  } catch (e) {
    console.error('Failed to deserialize result:', e);
    return null;
  }
}

// Helper to calculate MBTI based on answer scores
export function calculateMBTI(answers: { category: string; value: string }[]): { type: string; scores: number[] } {
  const counts = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  const totals = {
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0
  };

  answers.forEach((ans) => {
    const val = ans.value as keyof typeof counts;
    counts[val] += 1;
    
    if (ans.category === 'EI') totals.EI += 1;
    if (ans.category === 'SN') totals.SN += 1;
    if (ans.category === 'TF') totals.TF += 1;
    if (ans.category === 'JP') totals.JP += 1;
  });

  const eScore = Math.round((counts.E / (totals.EI || 1)) * 100);
  const nScore = Math.round((counts.N / (totals.SN || 1)) * 100);
  const fScore = Math.round((counts.F / (totals.TF || 1)) * 100);
  const pScore = Math.round((counts.P / (totals.JP || 1)) * 100);

  const type = [
    eScore >= 50 ? 'E' : 'I',
    nScore >= 50 ? 'N' : 'S',
    fScore >= 50 ? 'F' : 'T',
    pScore >= 50 ? 'P' : 'J'
  ].join('');

  // Save raw dimension scores
  return {
    type,
    scores: [eScore, nScore, fScore, pScore]
  };
}
