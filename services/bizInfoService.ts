import { BizInfoResponse, BizInfoItem } from '../types';
import { MOCK_DATA } from '../constants';

const API_BASE_URL = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do';

/**
 * Fetches support programs from the BizInfo API.
 * 
 * Uses 'api.allorigins.win' as a CORS proxy because the government API 
 * does not typically support direct browser calls (CORS).
 */
export const fetchSupportPrograms = async (
  region: string,
  categoryId: string,
  apiKey?: string
): Promise<BizInfoItem[]> => {
  
  // 1. If no API key is provided, return Mock Data (Demo Mode)
  if (!apiKey) {
    console.log("No API Key provided, using Mock Data");
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network
    return filterMockData(region, categoryId);
  }

  // 2. Construct API URL
  const params = new URLSearchParams();
  params.append('crtfcKey', apiKey);
  params.append('dataType', 'json');
  params.append('searchCnt', '100'); // Load up to 100 items
  
  if (categoryId) {
    params.append('searchLclasId', categoryId);
  }
  
  // Region works as a hashtag in this API
  if (region && region !== "전국") {
    params.append('hashtags', region);
  }

  const targetUrl = `${API_BASE_URL}?${params.toString()}`;
  
  // 3. Use CORS Proxy (AllOrigins) to bypass browser restrictions
  // Note: In a production app, you should use your own backend proxy.
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Network error: ${response.status}`);
    }

    const data: BizInfoResponse = await response.json();
    
    // 4. Parse Response
    // The API might return a single object if there's only one result, or an array.
    // Or null if no results.
    if (data && data.jsonArray) {
       const items = data.jsonArray.item;
       if (Array.isArray(items)) {
         return items;
       } else if (items) {
         // Single item object wrapped in array
         return [items];
       }
    }
    
    return [];

  } catch (error) {
    console.error("Real API Fetch Error:", error);
    // If real fetch fails (e.g. invalid key), fallback to empty or throw
    // Currently throwing to let the UI show an error state.
    throw error;
  }
};

// Helper for Mock Data filtering (Fallback logic)
const filterMockData = (region: string, categoryId: string): BizInfoItem[] => {
  let filteredData = [...MOCK_DATA];
    
  if (categoryId) {
    const categoryMap: {[key:string]: string} = {
      '01': '금융', '02': '기술', '03': '인력', '04': '수출',
      '05': '내수', '06': '창업', '07': '경영'
    };
    const targetCat = categoryMap[categoryId];
    if (targetCat) {
      filteredData = filteredData.filter(item => item.pldirSportRealmLclasCodeNm.includes(targetCat));
    }
  }

  if (region && region !== "전국") {
    filteredData = filteredData.filter(item => 
      (item.hashTags && item.hashTags.includes(region))
    );
  }
  
  return filteredData;
};