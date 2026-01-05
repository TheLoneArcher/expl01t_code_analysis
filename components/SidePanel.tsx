
import React from 'react';
import { AnalysisResponse, SelectionRange } from '../types';
import { BookOpen, HelpCircle, ChevronRight, Info, Sparkles } from 'lucide-react';

interface SidePanelProps {
  analysis: AnalysisResponse;
  selection: SelectionRange | null;
  furtherExplanation: string | null;
  theme: 'dark' | 'light';
}

const SidePanel: React.FC<SidePanelProps> = ({ analysis, selection, furtherExplanation, theme }) => {
  const getExplanationForRange = () => {
    if (!selection) return null;
    if (selection.start === selection.end) {
      return analysis.per_line_explanations.find(e => e.lineNumber === selection.start)?.explanation;
    }
    // Summary of the range
    const exps = analysis.per_line_explanations.filter(e => e.lineNumber >= selection.start && e.lineNumber <= selection.end);
    return exps.map(e => `[L${e.lineNumber}] ${e.explanation}`).join('\n');
  };

  const selectedExplanation = getExplanationForRange();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      <section>
        <h3 className={`flex items-center gap-2 text-[10px] font-black mb-5 uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-600'}`}>
          <Info size={14} /> Semantic Context
        </h3>
        {!selection ? (
          <div className={`p-8 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center opacity-40 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <HelpCircle className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-xs font-medium uppercase tracking-widest leading-relaxed">Select lines to view logic trace</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border transition-all ${
              theme === 'dark' ? 'bg-[#112240] border-[#64ffda]/30 shadow-[0_0_20px_rgba(100,255,218,0.05)]' : 'bg-white border-sky-100 shadow-sm'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'bg-sky-50 text-sky-600'}`}>
                  Selection: {selection.start === selection.end ? `L${selection.start}` : `Lines ${selection.start}-${selection.end}`}
                </span>
              </div>
              <div className={`text-[12px] leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                {selectedExplanation || "Semantic mapping unavailable for this selection."}
              </div>
            </div>
            
            {furtherExplanation && (
              <div className={`p-6 rounded-3xl border animate-in slide-in-from-top-2 duration-700 ${
                theme === 'dark' ? 'bg-[#112240] border-[#64ffda]/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase mb-4 opacity-50">
                   <Sparkles size={12} /> AI Deep-Reasoning Trace
                </div>
                <div className={`text-xs leading-relaxed space-y-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {furtherExplanation.split('\n').filter(p => p.trim()).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section>
        <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-500 mb-5 uppercase tracking-[0.2em]">
          <BookOpen size={14} /> Cognitive Registry
        </h3>
        <div className="space-y-4">
          {analysis.keyword_glossary.map((kw, idx) => (
            <div key={idx} className={`group p-5 rounded-3xl border transition-all hover:scale-[1.02] ${
              theme === 'dark' ? 'bg-[#112240]/40 border-[#1d2d44] hover:border-[#64ffda]/40' : 'bg-white border-slate-100 shadow-sm'
            }`}>
               <h4 className={`text-[13px] font-bold mb-1 flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                 {kw.term}
                 <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
               </h4>
               <p className={`text-[11px] leading-relaxed mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{kw.definition}</p>
               <div className={`pt-3 border-t ${theme === 'dark' ? 'border-[#1d2d44]' : 'border-slate-50'}`}>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-[#64ffda]/60' : 'text-sky-600/60'}`}>Practical Relevance</span>
                  <p className={`text-[11px] mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{kw.relevance}</p>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SidePanel;
