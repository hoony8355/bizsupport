export const REGIONS = [
  "전국",
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주"
];

// searchLclasId parameter values
export const CATEGORIES = [
  { id: "", name: "전체" },
  { id: "01", name: "금융" },
  { id: "02", name: "기술" },
  { id: "03", name: "인력" },
  { id: "04", name: "수출" },
  { id: "05", name: "내수" },
  { id: "06", name: "창업" },
  { id: "07", name: "경영" },
  { id: "09", name: "기타" },
];

export const MOCK_DATA = [
  {
    id: "MOCK_001",
    type: "program" as const,
    title: "[예시] 2025년 초기창업패키지 창업기업 모집 공고",
    organization: "중소벤처기업부",
    period: "20250201 ~ 20250315",
    url: "#",
    summary: "유망 창업아이템 및 고급기술을 보유한 초기창업기업의 사업화 자금 및 특화 프로그램을 지원합니다.",
    category: "창업",
    target: "창업 3년 이내 기업",
    tags: ["창업", "기술", "서울", "경기"],
    dateInfo: "2025.02.01 ~ 03.15"
  },
  {
    id: "MOCK_002",
    type: "event" as const,
    title: "[예시] 생성형 AI 활용 마케팅 실무 교육",
    organization: "서울산업진흥원",
    period: "20250401 ~ 20250402",
    url: "#",
    summary: "최신 생성형 AI 툴을 활용하여 마케팅 콘텐츠를 제작하는 실습 위주의 교육입니다.",
    category: "인력",
    areas: ["서울"],
    tags: ["교육", "AI", "마케팅"],
    dateInfo: "2025.04.01 ~ 04.02"
  }
];