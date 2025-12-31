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
  
  // Handle both 'hashtags' (JSON spec) and 'hashTags' (XML spec/potential variation)
  const getRawTags = (obj: any) => obj.hashtags || obj.hashTags || '';
  
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
      tags: parseTags(getRawTags(p)),
      dateInfo: formatPeriod(p.reqstBeginEndDe)
    };
  } else {
    const e = item as RawEventItem;
    // Event JSON keys are slightly different
    // Areas in events are often separated by @
    const areas = e.areaNm ? e.areaNm.split('@').filter(Boolean) : [];
    
    // Manual Page 20 lists 'orginlUrlAdres' (typo) as the key. We check both.
    const detailUrl = e.orginlUrlAdres || e.originUrlAdres || e.bizinfoUrl || '#';

    return {
      id: e.eventInfoId || `E_${Math.random()}`,
      type: 'event',
      title: e.nttNm || '제목 없음',
      organization: e.originEngnNm || '주최기관 미정',
      period: e.eventBeginEndDe || '',
      url: detailUrl,
      summary: stripAndTrim(e.nttCn),
      category: (e.pldirSportRealmLclasCodeNm || '').replace(/@/g, ','),
      areas: areas,
      tags: parseTags(getRawTags(e)),
      dateInfo: formatPeriod(e.eventBeginEndDe)
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
  
  // NOTE: Manual says searchCnt defaults to 500 if empty.
  // We strictly rely on pageUnit/pageIndex for pagination.
  
  // 3. Build Hashtags (Core Search Logic)
  const tags: string[] = [];

  // Region (Manual Page 7: Regions are passed as hashtags)
  if (filters.region && filters.region !== '전국') {
    tags.push(filters.region);
  }

  // Keyword (User Input)
  if (filters.keyword) {
    const keywords = filters.keyword.split(/[\s,]+/).filter(Boolean);
    tags.push(...keywords);
  }

  // Category
  if (filters.category) {
    // Manual Page 6/7: searchLclasId is a separate parameter for Category Codes (01, 02...)
    params.append('searchLclasId', filters.category);
    
    // Also adding category name to hashtags can help if ID filter is loose
    const catName = CATEGORIES.find(c => c.id === filters.category)?.name;
    if (catName) tags.push(catName);
  }

  if (tags.length > 0) {
    params.append('hashtags', tags.join(','));
  }

  // 4. Call via Proxy
  const targetUrl = `${endpoint}?${params.toString()}`;
  
  // Using corsproxy.io.
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from Proxy`);
    }
    
    // The API might return text/html even for JSON requests in error cases, or invalid JSON.
    const textData = await response.text();
    let data: any;
    
    try {
        data = JSON.parse(textData);
    } catch (e) {
        console.error("JSON Parse Error:", textData.substring(0, 100));
        throw new Error("Invalid JSON response from API");
    }
    
    let rawItems: any[] = [];
    
    // Manual Page 14/20: Response structure is {"jsonArray": [ ... ]}
    // However, some XML-to-JSON proxies might wrap it in 'item'.
    // We handle both native JSON structure and potential proxy wrapper structure.
    if (data && data.jsonArray) {
      if (Array.isArray(data.jsonArray)) {
        // Native JSON structure (as per Manual)
        rawItems = data.jsonArray;
      } else if (data.jsonArray.item) {
        // Fallback for XML-converted structures
        if (Array.isArray(data.jsonArray.item)) {
          rawItems = data.jsonArray.item;
        } else {
          rawItems = [data.jsonArray.item];
        }
      }
    }

    // Normalize
    return rawItems.map(item => normalizeItem(item, filters.type));

  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};