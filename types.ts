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
  status: 'OPEN' | 'CLOSED' | 'UPCOMING'; // Calculated Status
  dDay: string;            // e.g. "D-5", "마감", "접수중"
}

// Search Filter State
export interface SearchFilters {
  type: 'program' | 'event'; // Toggle between Program and Event
  region: string;
  category: string;
  keyword: string;           // User typed keyword (sent as hashtag)
  targets: string[];         // Selected target audience tags (e.g. 소상공인, 청년)
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  LOADING_MORE = 'LOADING_MORE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// --- Raw API Response Types (Internal use for parsing) ---

// Based on Manual Page 10 & 14
export interface RawProgramItem {
  pblancId: string;
  pblancNm: string;
  jrsdInsttNm: string;
  reqstBeginEndDe: string;
  pblancUrl: string;
  bsnsSumryCn: string;
  pldirSportRealmLclasCodeNm: string;
  trgetNm: string;
  hashtags?: string; // Manual JSON sample uses lowercase
  hashTags?: string; // XML uses CamelCase (fallback)
  creatPnttm: string;
}

// Based on Manual Page 16 & 19-20
export interface RawEventItem {
  eventInfoId: string;
  nttNm: string;
  originEngnNm: string;
  eventBeginEndDe: string;
  
  // Manual Page 20 explicitly lists "orginlUrlAdres" (typo in API spec)
  orginlUrlAdres?: string; 
  originUrlAdres?: string; // Correct spelling fallback
  bizinfoUrl?: string; 

  nttCn: string;
  pldirSportRealmLclasCodeNm: string;
  areaNm: string;      
  
  hashtags?: string; // Manual JSON sample uses lowercase
  hashTags?: string; // XML uses CamelCase (fallback)
  
  registDe: string;
}

export interface BizInfoApiResponse {
  // Manual Page 14/20: The root object contains jsonArray which IS the array.
  jsonArray: RawProgramItem[] | RawEventItem[] | { item: any[] }; 
}