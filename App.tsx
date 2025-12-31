import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProgramCard from './components/ProgramCard';
import { SearchFilters, BizInfoItem, LoadingState } from './types';
import { fetchSupportPrograms } from './services/bizInfoService';
import { AlertCircle, Inbox, Key } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [filters, setFilters] = useState<SearchFilters>({
    region: '전국',
    category: '' // Empty string means 'All'
  });
  
  // Load API Key from localStorage if available
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('bizInfoApiKey') || '';
  });

  const [items, setItems] = useState<BizInfoItem[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  
  // Persist API Key
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('bizInfoApiKey', apiKey);
    } else {
      localStorage.removeItem('bizInfoApiKey');
    }
  }, [apiKey]);

  // Handler
  const handleSearch = async () => {
    setStatus(LoadingState.LOADING);
    setItems([]); // Clear previous results while loading
    
    try {
      // Pass apiKey to service
      const data = await fetchSupportPrograms(filters.region, filters.category, apiKey);
      setItems(data);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  // Initial load
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Text */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">어떤 지원이 필요하신가요?</h2>
          <p className="text-slate-600">
            기업의 위치와 필요한 지원 분야를 선택하여 <br className="sm:hidden"/>맞춤형 정부 지원사업을 확인해보세요.
          </p>
        </div>

        {/* Filters */}
        <FilterBar 
          filters={filters} 
          setFilters={setFilters} 
          onSearch={handleSearch} 
          isLoading={status === LoadingState.LOADING}
          apiKey={apiKey}
          setApiKey={setApiKey}
        />

        {/* Content Area */}
        <div className="mt-8">
          
          {/* Notification when no API Key is present */}
          {!apiKey && status !== LoadingState.LOADING && (
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-sm text-blue-800">
                <Key className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                   <span className="font-bold block mb-1">현재 샘플 데이터 모드입니다.</span>
                   실시간 공고를 확인하려면 상단 <strong>[API 설정]</strong>에서 인증키를 입력해주세요.
                </div>
             </div>
          )}
          
          {/* Loading State */}
          {status === LoadingState.LOADING && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
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
              <div className="mt-2 text-sm opacity-90 max-w-md mx-auto space-y-1">
                 <p>1. API 인증키가 올바른지 확인해주세요.</p>
                 <p>2. 일일 트래픽 한도가 초과되었을 수 있습니다.</p>
              </div>
              <button 
                onClick={handleSearch}
                className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
              >
                다시 시도하기
              </button>
            </div>
          )}

          {/* Empty State */}
          {status === LoadingState.SUCCESS && items.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-500">
              <Inbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-900">검색 결과가 없습니다.</p>
              <p className="text-sm mt-2">다른 지역이나 카테고리로 검색해보세요.</p>
            </div>
          )}

          {/* Result Grid */}
          {status === LoadingState.SUCCESS && items.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-slate-800">
                   검색 결과 <span className="text-indigo-600">{items.length}</span>건
                 </h3>
                 {apiKey && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 font-medium">
                       ● 실시간 API 데이터
                    </span>
                 )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <ProgramCard key={item.pblancId || index} item={item} />
                ))}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;