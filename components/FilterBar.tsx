import React, { useState } from 'react';
import { MapPin, Briefcase, Search, Settings, Key, Info } from 'lucide-react';
import { REGIONS, CATEGORIES } from '../constants';
import { SearchFilters } from '../types';

interface FilterBarProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
  isLoading: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  setFilters, 
  onSearch, 
  isLoading,
  apiKey,
  setApiKey
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const handleChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
      {/* API Settings Header (Collapsible) */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-slate-500">
           <Info className="w-3.5 h-3.5" />
           <span>실시간 데이터를 보려면 API 인증키가 필요합니다.</span>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{showSettings ? '설정 닫기' : 'API 설정'}</span>
        </button>
      </div>

      {/* API Key Input Section */}
      {showSettings && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
             <Key className="w-3.5 h-3.5" /> 공공데이터포털 인증키 (Service Key)
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API 인증키를 입력하세요 (예: abcd123...)"
              className="flex-grow bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            * 인증키가 없으면 샘플 데이터(2024년 기준)가 표시됩니다.<br/>
            * 인증키는 로컬 브라우저에만 저장됩니다.
          </p>
        </div>
      )}

      {/* Main Filter Section */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Region Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <MapPin className="w-3 h-3" /> 기업 위치 (지역)
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
              value={filters.region}
              onChange={(e) => handleChange('region', e.target.value)}
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> 지원 분야 (업력/목적)
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={onSearch}
              disabled={isLoading}
              className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  조회중...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {apiKey ? '실시간 조회' : '샘플 조회'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;