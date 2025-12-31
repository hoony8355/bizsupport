// API Response Types based on the documentation

export interface BizInfoItem {
  pblancId: string; // Unique ID (e.g., PBLN_...)
  pblancNm: string; // Title
  jrsdInsttNm: string; // Jurisdiction Agency (e.g., 중소벤처기업부)
  reqstBeginEndDe: string; // Request Period (e.g., 20220727 ~ 20220930)
  pblancUrl: string; // Detail URL
  bsnsSumryCn: string; // Summary
  pldirSportRealmLclasCodeNm: string; // Category Name (e.g., 경영, 기술)
  totCnt?: string;
  hashTags?: string;
  trgetNm?: string; // Target (e.g., 중소기업)
}

export interface BizInfoResponse {
  jsonArray: {
    item: BizInfoItem[];
    totalCount?: number; // Depending on API version sometimes this is separate
    [key: string]: any;
  }
}

// Application specific types
export interface SearchFilters {
  region: string;
  category: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}