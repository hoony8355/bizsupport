// Normalized Data Structure for the UI
export interface UnifiedBizItem {
  id: string;              // Unique ID (pblancId or eventInfoId)
  type: 'program' | 'event';
  title: string;           // Title
  organization: string;    // Jurisdiction/Origin Organization
  period: string;          // Request/Event Period
  url: string;             // Detail URL
  summary: string;         // Plain text summary (HTML stripped)
  category: string;        // Category Name
  target?: string;         // Target audience (Program only)
  areas?: string[];        // Areas (Event only)
  tags: string[];          // Hashtags
  dateInfo: string;        // Display formatted date string
}

// Search Filter State
export interface SearchFilters {
  type: 'program' | 'event'; // Toggle between Program and Event
  region: string;
  category: string;
  keyword: string;           // User typed keyword (sent as hashtag)
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADING_MORE = 'LOADING_MORE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// --- Raw API Response Types (Internal use for parsing) ---

export interface RawProgramItem {
  pblancId: string;
  pblancNm: string;
  jrsdInsttNm: string;
  reqstBeginEndDe: string;
  pblancUrl: string;
  bsnsSumryCn: string;
  pldirSportRealmLclasCodeNm: string;
  trgetNm: string;
  hashTags: string;
  creatPnttm: string;
}

export interface RawEventItem {
  eventInfoId: string; // Document says 'seq' in XML, 'eventInfoId' or similar in JSON (mapping varies, we handle flexibly)
  nttNm: string;
  originEngnNm: string;
  eventBeginEndDe: string;
  originUrlAdres?: string; // Sometimes distinct
  bizinfoUrl?: string; // Sometimes distinct
  nttCn: string;
  pldirSportRealmLclasCodeNm: string;
  areaNm: string;      // Separated by @
  hashTags: string;
  registDe: string;
}

export interface BizInfoApiResponse {
  jsonArray: {
    item: any[]; // Can be array or single object
    [key: string]: any;
  }
}