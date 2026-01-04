import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Briefcase, Search, Settings, Key, Info, FileText, Calendar, Check, ChevronDown } from 'lucide-react';
import { REGIONS, CATEGORIES, TARGET_KEYWORDS } from '../constants';
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
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  
  // Close region dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRegionToggle = (region: string) => {
    setFilters(prev => {
      const current = prev.region;
      let newRegions = [...current];

      if (region === '전국') {
        // Exclusive '전국': if clicked, clear others
        // If it was already selected, do nothing or allow deselection? 
        // Let's make it simple: clicking '전국' sets it to ONLY '전국'
        return { ...prev, region: ['전국'] };
      }

      // If '전국' was previously selected alone, remove it when adding a specific region
      if (newRegions.length === 1 && newRegions[0] === '전국') {
        newRegions = [];
      }

      if (newRegions.includes(region)) {
        newRegions = newRegions.filter(r => r !== region);
      } else {
        newRegions.push(region);
      }

      // If nothing is selected, revert to '전국'
      if (newRegions.length === 0) {
        newRegions = ['전국'];
      }

      return { ...prev, region: newRegions };
    });
  };

  const toggleTarget = (target: string) => {
    setFilters(prev => {
      const current = prev.targets;
      if (current.includes(target)) {
        return { ...prev, targets: current.filter(t => t !== target) };
      } else {
        return { ...prev, targets: [...current, target] };
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const getRegionDisplayText = () => {
    if (filters.region.length === 0) return '지역 선택';
    if (filters.region.length === 1) return filters.region[0];
    if (filters.region.length <= 2) return filters.region.join(', ');
    return `${filters.region[0]} 외 ${filters.region.length - 1}곳`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 relative">
      {/* API Settings Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center rounded-t-xl">
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

      {/* API Key Input */}
      {showSettings && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 animate-fadeIn">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
             <Key className="w-3.5 h-3.5" /> 공공데이터포털 인증키 (Service Key)
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API 인증키를 입력하세요"
              className="flex-grow bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
            />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            * 인증키 미입력 시 샘플 데이터가 표시됩니다.
          </p>
        </div>
      )}

      {/* Filter Tabs (Type Selection) */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => handleChange('type', 'program')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            filters.type === 'program' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/10' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" /> 지원사업 공고
        </button>
        <button
          onClick={() => handleChange('type', 'event')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            filters.type === 'event' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/10' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" /> 행사/교육 정보
        </button>
      </div>

      {/* Main Filter Inputs */}
      <div className="p-4 space-y-4">
        
        {/* Row 1: Keyword Search */}
        <div className="relative">
           <input 
             type="text"
             value={filters.keyword}
             onChange={(e) => handleChange('keyword', e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder={filters.type === 'program' ? "키워드 입력 (예: 스마트공장, AI, 마케팅)" : "키워드 입력 (예: 설명회, 교육, 세미나)"}
             className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all text-sm"
           />
           <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Row 2: Selectors */}
        <div className="grid grid-cols-2 gap-3">
          {/* Region Multi-Select */}
          <div className="relative" ref={regionRef}>
            <button
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              className="w-full pl-9 pr-8 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between p-2.5"
            >
              <span className="truncate">{getRegionDisplayText()}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            
            {/* Region Dropdown */}
            {isRegionOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1.5 animate-fadeIn">
                <div className="grid grid-cols-2 gap-1">
                  {REGIONS.map((region) => {
                    const isSelected = filters.region.includes(region);
                    return (
                      <button
                        key={region}
                        onClick={() => handleRegionToggle(region)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors text-left ${
                          isSelected 
                            ? 'bg-indigo-50 text-indigo-700 font-medium' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {region}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <select
              className="w-full pl-9 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 appearance-none"
              value={filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Row 3: Target Chips (Hashtags) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">맞춤 대상 선택 (중복 가능)</label>
          <div className="flex flex-wrap gap-2">
            {TARGET_KEYWORDS.map(target => {
              const isSelected = filters.targets.includes(target);
              return (
                <button
                  key={target}
                  onClick={() => toggleTarget(target)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {target}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm px-5 py-3 flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 rounded-b-lg"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              데이터 조회중...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              조건으로 조회하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;