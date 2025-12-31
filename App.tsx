import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProgramCard from './components/ProgramCard';
import { SearchFilters, UnifiedBizItem, LoadingState } from './types';
import { fetchBizInfo } from './services/bizInfoService';
import { AlertCircle, Inbox, Key, ChevronDown, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Filters State
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'program',
    region: '전국',
    category: '',
    keyword: ''
  });
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('bizInfoApiKey') || '';
  });

  // Data State
  const [items, setItems] = useState<UnifiedBizItem[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Persist API Key
  useEffect(() => {
    if (apiKey) localStorage.setItem('bizInfoApiKey', apiKey);
    else localStorage.removeItem('bizInfoApiKey');
  }, [apiKey]);

  // Main Search Function
  const handleSearch = async (isLoadMore = false) => {
    const nextPage = isLoadMore ? page + 1 : 1;
    
    if (isLoadMore) {
      setStatus(LoadingState.LOADING_MORE);
    } else {
      setStatus(LoadingState.LOADING);
      setItems([]); // Clear if new search
      setHasMore(true);
    }

    try {
      const newItems = await fetchBizInfo(filters, nextPage, apiKey);
      
      if (isLoadMore) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setItems(newItems);
      }
      
      // If we got fewer items than requested (12), it means we reached the end
      if (newItems.length < 12) {
        setHasMore(false);
      }
      
      setPage(nextPage);
      setStatus(LoadingState.SUCCESS);

    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  // Initial Load
  useEffect(() => {
    handleSearch(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {filters.type === 'program' ? '정부 지원사업 찾기' : '행사·교육 정보 찾기'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {filters.type === 'program' 
              ? '기업 성장에 필요한 공고를 맞춤형으로 검색해보세요.' 
              : '비즈니스 역량을 높여줄 세미나와 교육 정보를 확인하세요.'}
          </p>
        </div>

        {/* Filters */}
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={() => handleSearch(false)} 
          isLoading={status === LoadingState.LOADING}
          apiKey={apiKey}
          setApiKey={setApiKey}
        />

        {/* Content Area */}
        <div className="mt-8">
          
          {/* Mock Mode Notice */}
          {!apiKey && status !== LoadingState.LOADING && (
             <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3 text-sm text-indigo-800">
                <Key className="w-5 h-5 flex-shrink-0 mt-0.5 text-indigo-600" />
                <div>
                   <span className="font-bold block mb-1">현재 샘플 데이터 모드입니다.</span>
                   실시간 전체 데이터를 검색하려면 상단 <strong>[API 설정]</strong>에서 키를 등록해주세요.
                </div>
             </div>
          )}
          
          {/* Initial Loading Skeleton */}
          {status === LoadingState.LOADING && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
               ))}
            </div>
          )}

          {/* Error State */}
          {status === LoadingState.ERROR && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center text-red-700">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-lg">데이터를 불러오지 못했습니다.</p>
              <p className="text-sm mt-1 opacity-80">API 키가 올바른지 확인하거나 잠시 후 다시 시도해주세요.</p>
              <button onClick={() => handleSearch(false)} className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-50">재시도</button>
            </div>
          )}

          {/* Empty State */}
          {status === LoadingState.SUCCESS && items.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-900">검색 결과가 없습니다.</p>
              <p className="text-sm mt-2">다른 키워드나 필터로 검색해보세요.</p>
            </div>
          )}

          {/* Results */}
          {items.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4 px-1">
                 <span className="text-sm font-semibold text-slate-700">
                   검색 결과 <span className="text-indigo-600">{items.length}</span>건 이상
                 </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <ProgramCard key={item.id} item={item} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={() => handleSearch(true)}
                    disabled={status === LoadingState.LOADING_MORE}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 shadow-sm rounded-full text-slate-600 font-medium hover:bg-slate-50 hover:text-indigo-600 transition-all disabled:opacity-70"
                  >
                    {status === LoadingState.LOADING_MORE ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> 더 보기
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;