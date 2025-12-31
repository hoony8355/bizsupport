import React from 'react';
import { Calendar, Building, ExternalLink, Tag, MapPin } from 'lucide-react';
import { UnifiedBizItem } from '../types';

interface ProgramCardProps {
  item: UnifiedBizItem;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ item }) => {
  
  // Badge Color based on category name
  const getBadgeColor = (category: string) => {
    const cat = category || '';
    if (cat.includes("금융")) return "bg-green-100 text-green-700 border-green-200";
    if (cat.includes("기술") || cat.includes("R&D")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (cat.includes("창업")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (cat.includes("수출")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (cat.includes("교육") || cat.includes("인력")) return "bg-teal-100 text-teal-700 border-teal-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col h-full">
      
      {/* Header: Category & Org */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getBadgeColor(item.category)}`}>
          {item.category || (item.type === 'event' ? '행사' : '기타')}
        </span>
        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[50%] text-right">
          {item.organization}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {item.title}
      </h3>

      {/* Summary (Plain Text) */}
      <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed flex-grow">
        {item.summary || "상세 내용을 공고문에서 확인하세요."}
      </p>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-50 mt-auto space-y-1.5">
        
        {/* Target or Area */}
        {item.type === 'program' && item.target && (
           <div className="flex items-center gap-1.5 text-xs text-slate-500">
             <Building className="w-3.5 h-3.5 text-slate-400" />
             <span className="truncate">{item.target}</span>
           </div>
        )}
        {item.type === 'event' && item.areas && item.areas.length > 0 && (
           <div className="flex items-center gap-1.5 text-xs text-slate-500">
             <MapPin className="w-3.5 h-3.5 text-slate-400" />
             <span className="truncate">{item.areas.join(', ')}</span>
           </div>
        )}
        
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{item.dateInfo}</span>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 overflow-hidden">
                <Tag className="w-3 h-3 flex-shrink-0" />
                <div className="flex gap-1 flex-wrap">
                  {item.tags.slice(0, 3).map((t, i) => (
                    <span key={i} className="bg-slate-50 px-1.5 py-0.5 rounded text-slate-500">#{t}</span>
                  ))}
                </div>
            </div>
        )}

        {/* Action Button */}
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 block w-full text-center bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-medium py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
        >
          상세보기 <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default ProgramCard;