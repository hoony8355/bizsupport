import React from 'react';
import { Building2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">BizSupport</h1>
            <p className="text-xs text-slate-500 hidden sm:block">중소기업 지원사업 맞춤 조회</p>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-500">
            공공데이터포털 API 연동
        </div>
      </div>
    </header>
  );
};

export default Header;