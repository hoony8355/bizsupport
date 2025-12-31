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

// Mapping API codes to display names
// searchLclasId parameter values
export const CATEGORIES = [
  { id: "", name: "전체" },
  { id: "01", name: "금융 (융자/보증)" },
  { id: "02", name: "기술 (R&D)" },
  { id: "03", name: "인력" },
  { id: "04", name: "수출" },
  { id: "05", name: "내수" },
  { id: "06", name: "창업 (예비/초기)" },
  { id: "07", name: "경영" },
  { id: "09", name: "기타" },
];

export const MOCK_DATA = [
  {
    pblancId: "MOCK_001",
    pblancNm: "[예시] 2024년 초기창업패키지 창업기업 모집 공고",
    jrsdInsttNm: "중소벤처기업부",
    reqstBeginEndDe: "20240201 ~ 20240315",
    pblancUrl: "#",
    bsnsSumryCn: "유망 창업아이템 및 고급기술을 보유한 초기창업기업의 사업화 자금 및 특화 프로그램을 지원합니다.",
    pldirSportRealmLclasCodeNm: "창업",
    trgetNm: "창업 3년 이내 기업",
    hashTags: "창업,기술,서울,경기"
  },
  {
    pblancId: "MOCK_002",
    pblancNm: "[예시] 중소기업 정책자금(운전) 융자 지원",
    jrsdInsttNm: "중소벤처기업진흥공단",
    reqstBeginEndDe: "20240110 ~ 예산 소진시",
    pblancUrl: "#",
    bsnsSumryCn: "경영애로 해소 및 생산성 향상을 위한 운전 자금을 융자 지원해 드립니다.",
    pldirSportRealmLclasCodeNm: "금융",
    trgetNm: "중소기업",
    hashTags: "금융,전국"
  },
  {
    pblancId: "MOCK_003",
    pblancNm: "[예시] 수출바우처 사업 참여기업 모집",
    jrsdInsttNm: "산업통상자원부",
    reqstBeginEndDe: "20240301 ~ 20240331",
    pblancUrl: "#",
    bsnsSumryCn: "수출 유망 중소기업을 대상으로 해외 마케팅 서비스를 바우처 형태로 지원합니다.",
    pldirSportRealmLclasCodeNm: "수출",
    trgetNm: "수출 실적 보유 기업",
    hashTags: "수출,부산,인천"
  },
  {
    pblancId: "MOCK_004",
    pblancNm: "[예시] 스마트공장 구축 및 고도화 지원사업",
    jrsdInsttNm: "스마트제조혁신추진단",
    reqstBeginEndDe: "20240401 ~ 20240501",
    pblancUrl: "#",
    bsnsSumryCn: "제조 현장의 경쟁력 제고를 위해 스마트공장 구축을 지원합니다.",
    pldirSportRealmLclasCodeNm: "기술",
    trgetNm: "제조 중소기업",
    hashTags: "기술,대구,경북"
  }
];