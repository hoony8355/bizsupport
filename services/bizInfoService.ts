import { UnifiedBizItem, BizInfoApiResponse, SearchFilters, RawProgramItem, RawEventItem } from '../types';
import { MOCK_DATA, CATEGORIES } from '../constants';

const BASE_URL_PROGRAM = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do';
const BASE_URL_EVENT = 'https://www.bizinfo.go.kr/uss/rss/bizinfoEventApi.do';

/**
 * Strips HTML tags from a string.
 */
const stripHtml = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Converts relative URLs to absolute URLs for bizinfo domain.
 */
const makeAbsoluteUrl = (url?: string): string => {
  if (!url || url === '#') return '#';
  const trimmed = url.trim();
  if (trimmed.match(/^https?:\/\//i)) return trimmed;
  if (trimmed.startsWith('/')) return `https://www.bizinfo.go.kr${trimmed}`;
  return trimmed;
};

/**
 * Calculates D-Day and Status from period string
 */
const calculateStatus = (period: string): { status: 'OPEN' | 'CLOSED' | 'UPCOMING', dDay: string } => {
  if (!period) return { status: 'OPEN', dDay: '상시/미정' };

  // Extract dates (Matches YYYYMMDD)
  const dates = period.match(/\d{8}/g); 
  if (!dates || dates.length === 0) return { status: 'OPEN', dDay: '일정 확인' };

  const today = new Date();
  today.setHours(0,0,0,0);

  // Parse End Date
  const endStr = dates[dates.length - 1]; // Use the last date found as end date
  const eYear = parseInt(endStr.substring(0, 4));
  const eMonth = parseInt(endStr.substring(4, 6)) - 1;
  const eDay = parseInt(endStr.substring(6, 8));
  const endDate = new Date(eYear, eMonth, eDay);

  // Parse Start Date (if available)
  let startDate = new Date();
  if (dates.length > 1) {
    const startStr = dates[0];
    const sYear = parseInt(startStr.substring(0, 4));
    const sMonth = parseInt(startStr.substring(4, 6)) - 1;
    const sDay = parseInt(startStr.substring(6, 8));
    startDate = new Date(sYear, sMonth, sDay);
  } else {
    startDate = endDate; // Fallback if only one date
  }
  
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'CLOSED', dDay: '마감' };
  
  // Check if upcoming
  if (startDate > today) {
     return { status: 'UPCOMING', dDay: '접수예정' };
  }

  if (diffDays === 0) return { status: 'OPEN', dDay: 'D-Day' };
  if (diffDays <= 14) return { status: 'OPEN', dDay: `D-${diffDays}` };
  
  return { status: 'OPEN', dDay: '접수중' };
};

/**
 * Normalizes API response items into a unified structure.
 */
const normalizeItem = (item: any, type: 'program' | 'event'): UnifiedBizItem => {
  // Common Logic
  const stripAndTrim = (val: string) => stripHtml(val).trim();
  
  const getRawTags = (obj: any) => obj.hashtags || obj.hashTags || '';
  const parseTags = (tagStr: string) => tagStr ? tagStr.split(',').map(t => t.trim()).filter(Boolean) : [];
  
  const formatPeriod = (period: string) => {
    if (!period) return '기간 미정';
    const clean = period.replace(/[^0-9~]/g, '');
    if (clean.length >= 17) {
       const start = `${clean.substring(0,4)}.${clean.substring(4,6)}.${clean.substring(6,8)}`;
       const end = `${clean.substring(13,15)}.${clean.substring(15,17)}`;
       return `${start} ~ ${end}`;
    }
    return period;
  };

  if (type === 'program') {
    const p = item as RawProgramItem;
    const viewUrl = makeAbsoluteUrl(p.pblancUrl);
    const { status, dDay } = calculateStatus(p.reqstBeginEndDe);

    return {
      id: p.pblancId || `P_${Math.random()}`,
      type: 'program',
      title: p.pblancNm || '제목 없음',
      organization: p.jrsdInsttNm || '소관기관 미정',
      period: p.reqstBeginEndDe || '',
      url: viewUrl,
      summary: stripAndTrim(p.bsnsSumryCn),
      category: p.pldirSportRealmLclasCodeNm || '기타',
      target: p.trgetNm,
      tags: parseTags(getRawTags(p)),
      dateInfo: formatPeriod(p.reqstBeginEndDe),
      status,
      dDay
    };
  } else {
    const e = item as RawEventItem;
    const areas = e.areaNm ? e.areaNm.split('@').filter(Boolean) : [];
    
    const externalUrl = e.orginlUrlAdres || e.originUrlAdres;
    const internalUrl = e.bizinfoUrl;
    
    let finalUrl = '#';
    if (externalUrl && externalUrl !== '#') {
        finalUrl = makeAbsoluteUrl(externalUrl);
    } else if (internalUrl) {
        finalUrl = makeAbsoluteUrl(internalUrl);
    }

    const { status, dDay } = calculateStatus(e.eventBeginEndDe);

    return {
      id: e.eventInfoId || `E_${Math.random()}`,
      type: 'event',
      title: e.nttNm || '제목 없음',
      organization: e.originEngnNm || '주최기관 미정',
      period: e.eventBeginEndDe || '',
      url: finalUrl,
      summary: stripAndTrim(e.nttCn),
      category: (e.pldirSportRealmLclasCodeNm || '').replace(/@/g, ','),
      areas: areas,
      tags: parseTags(getRawTags(e)),
      dateInfo: formatPeriod(e.eventBeginEndDe),
      status,
      dDay
    };
  }
};

/**
 * Fetches data from BizInfo API.
 */
export const fetchBizInfo = async (
  filters: SearchFilters,
  pageIndex: number,
  apiKey?: string
): Promise<UnifiedBizItem[]> => {
  
  if (!apiKey) {
    if (pageIndex > 1) return [];
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOCK_DATA.filter(item => item.type === filters.type);
  }

  const endpoint = filters.type === 'program' ? BASE_URL_PROGRAM : BASE_URL_EVENT;
  const params = new URLSearchParams();
  params.append('crtfcKey', apiKey);
  params.append('dataType', 'json');
  params.append('pageIndex', pageIndex.toString());
  params.append('pageUnit', '12');
  
  const tags: string[] = [];

  // Region
  if (filters.region && filters.region.length > 0) {
    // If "전국" is the only selection, we don't add specific region tags (implies All/Nationwide scope in legacy logic)
    // However, if user selects "전국" AND "서울", we send both.
    const isOnlyNationwide = filters.region.length === 1 && filters.region[0] === '전국';
    
    if (!isOnlyNationwide) {
      tags.push(...filters.region);
    }
  }

  // Keyword
  if (filters.keyword) {
    const keywords = filters.keyword.split(/[\s,]+/).filter(Boolean);
    tags.push(...keywords);
  }
  
  // Target Chips (Important for detailed search)
  if (filters.targets && filters.targets.length > 0) {
    tags.push(...filters.targets);
  }

  // Category
  if (filters.category) {
    params.append('searchLclasId', filters.category);
  }

  if (tags.length > 0) {
    params.append('hashtags', tags.join(','));
  }

  const targetUrl = `${endpoint}?${params.toString()}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from Proxy`);
    }
    
    const textData = await response.text();
    let data: any;
    
    try {
        data = JSON.parse(textData);
    } catch (e) {
        console.error("JSON Parse Error:", textData.substring(0, 100));
        throw new Error("Invalid JSON response from API");
    }
    
    let rawItems: any[] = [];
    
    if (data && data.jsonArray) {
      if (Array.isArray(data.jsonArray)) {
        rawItems = data.jsonArray;
      } else if (data.jsonArray.item) {
        if (Array.isArray(data.jsonArray.item)) {
          rawItems = data.jsonArray.item;
        } else {
          rawItems = [data.jsonArray.item];
        }
      }
    }

    return rawItems.map(item => normalizeItem(item, filters.type));

  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};