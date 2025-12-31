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
 * Normalizes API response items into a unified structure.
 */
const normalizeItem = (item: any, type: 'program' | 'event'): UnifiedBizItem => {
  // Common Logic
  const stripAndTrim = (val: string) => stripHtml(val).trim();
  const parseTags = (tagStr: string) => tagStr ? tagStr.split(',').map(t => t.trim()).filter(Boolean) : [];
  
  // Date Formatting (YYYYMMDD ~ YYYYMMDD -> YYYY.MM.DD ~ MM.DD)
  const formatPeriod = (period: string) => {
    if (!period) return '기간 미정';
    const clean = period.replace(/[^0-9~]/g, '');
    if (clean.length >= 17) { // 20220101~20220102
       const start = `${clean.substring(0,4)}.${clean.substring(4,6)}.${clean.substring(6,8)}`;
       const end = `${clean.substring(13,15)}.${clean.substring(15,17)}`;
       return `${start} ~ ${end}`;
    }
    return period;
  };

  if (type === 'program') {
    const p = item as RawProgramItem;
    // JSON keys based on documentation
    return {
      id: p.pblancId || `P_${Math.random()}`,
      type: 'program',
      title: p.pblancNm || '제목 없음',
      organization: p.jrsdInsttNm || '소관기관 미정',
      period: p.reqstBeginEndDe || '',
      url: p.pblancUrl || '#',
      summary: stripAndTrim(p.bsnsSumryCn),
      category: p.pldirSportRealmLclasCodeNm || '기타',
      target: p.trgetNm,
      tags: parseTags(p.hashTags),
      dateInfo: formatPeriod(p.reqstBeginEndDe)
    };
  } else {
    const e = item as RawEventItem;
    // Event JSON keys are slightly different
    // Areas in events are often separated by @
    const areas = e.areaNm ? e.areaNm.split('@').filter(Boolean) : [];
    
    return {
      id: e.eventInfoId || (item.seq) || `E_${Math.random()}`, // Sometimes JSON key varies
      type: 'event',
      title: e.nttNm || item.title || '제목 없음',
      organization: e.originEngnNm || item.originOrg || '주최기관 미정',
      period: e.eventBeginEndDe || item.eventPeriod || '',
      url: e.originUrlAdres || e.bizinfoUrl || item.link || '#',
      summary: stripAndTrim(e.nttCn || item.description),
      category: (e.pldirSportRealmLclasCodeNm || item.lcategory || '').replace(/@/g, ','),
      areas: areas,
      tags: parseTags(e.hashTags || item.hashtags),
      dateInfo: formatPeriod(e.eventBeginEndDe || item.eventPeriod)
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
    // Return Mock Data for Demo
    if (pageIndex > 1) return []; // No pagination for mock
    await new Promise(resolve => setTimeout(resolve, 600));
    return MOCK_DATA.filter(item => item.type === filters.type);
  }

  // 1. Determine Endpoint
  const endpoint = filters.type === 'program' ? BASE_URL_PROGRAM : BASE_URL_EVENT;

  // 2. Build Parameters
  const params = new URLSearchParams();
  params.append('crtfcKey', apiKey);
  params.append('dataType', 'json');
  params.append('pageIndex', pageIndex.toString());
  params.append('pageUnit', '12'); // Fetch 12 items per page
  params.append('_t', Date.now().toString()); // Cache busting

  // 3. Build Hashtags (Core Search Logic)
  // The API uses 'hashtags' for keyword search as well as region
  const tags: string[] = [];

  // Region
  if (filters.region && filters.region !== '전국') {
    tags.push(filters.region);
  }

  // Keyword (User Input)
  if (filters.keyword) {
    // Split by space or comma and add
    const keywords = filters.keyword.split(/[\s,]+/).filter(Boolean);
    tags.push(...keywords);
  }

  // Add category name to hashtags to improve search if ID search isn't enough
  if (filters.category) {
    params.append('searchLclasId', filters.category);
    const catName = CATEGORIES.find(c => c.id === filters.category)?.name;
    if (catName) tags.push(catName);
  }

  if (tags.length > 0) {
    // Join with comma
    params.append('hashtags', tags.join(','));
  }

  // 4. Call via Proxy
  const targetUrl = `${endpoint}?${params.toString()}`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data: BizInfoApiResponse = await response.json();
    
    let rawItems: any[] = [];
    if (data && data.jsonArray) {
      if (Array.isArray(data.jsonArray.item)) {
        rawItems = data.jsonArray.item;
      } else if (data.jsonArray.item) {
        rawItems = [data.jsonArray.item];
      }
    }

    // Normalize
    return rawItems.map(item => normalizeItem(item, filters.type));

  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};