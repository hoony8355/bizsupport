import React from 'react';
import { Calendar, Building, ExternalLink, Tag } from 'lucide-react';
import { BizInfoItem } from '../types';

interface ProgramCardProps {
  item: BizInfoItem;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ item }) => {
  // Parse date for better display
  const formatDate = (dateString: string) => {
    // API returns ranges often like YYYYMMDD ~ YYYYMMDD
    if (!dateString) return "기간 미정";
    
    // Basic cleanup formatting
    return dateString.replace(/(\d{4})(\d{2})(\d{2})/g, '$1.$2.$3');
  };

  // Badge Color based on category name
  const getBadgeColor = (category: string) => {
    if (category.includes("금융")) return "bg-green-100 text-green-800";
    if (category.includes("기술") || category.includes("R&D")) return "bg-blue-100 text-blue-800";
    if (category.includes("창업")) return "bg-purple-100 text-purple-800";
    if (category.includes("수출")) return "bg-orange-100 text-orange-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${getBadgeColor(item.pldirSportRealmLclasCodeNm)}`}>
          {item.pldirSportRealmLclasCodeNm || "기타"}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {item.jrsdInsttNm}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {item.pblancNm}
      </h3>

      <p className="text-sm text-slate-600 mb-4 line-clamp-3 flex-grow">
        {item.bsnsSumryCn || "상세 내용을 확인하세요."}
      </p>

      <div className="pt-4 border-t border-slate-100 mt-auto space-y-2">
        {/* Target */}
        {item.trgetNm && (
           <div className="flex items-center gap-2 text-xs text-slate-500">
             <Building className="w-3.5 h-3.5" />
             <span className="truncate">{item.trgetNm}</span>
           </div>
        )}
        
        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(item.reqstBeginEndDe)}</span>
        </div>

        {/* Hashtags */}
        {item.hashTags && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <Tag className="w-3 h-3" />
                <span className="truncate">{item.hashTags.split(',').slice(0, 3).join(', ')}</span>
            </div>
        )}

        {/* Link Button */}
        <a 
          href={item.pblancUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-2 rounded-lg text-sm transition-colors"
        >
          <span>공고 확인하기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default ProgramCard;