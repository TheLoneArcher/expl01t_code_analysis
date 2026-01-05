
import React, { useMemo } from 'react';
import { AnalysisResponse, SelectionRange } from '../types';
import { Sparkles, Terminal } from 'lucide-react';

interface CodeExplorerProps {
  code: string;
  analysis: AnalysisResponse;
  hoveredLine: number | null;
  selection: SelectionRange | null;
  onLineHover: (line: number | null) => void;
  onLineClick: (line: number, shiftKey: boolean) => void;
  onDeepDive: (range: SelectionRange) => void;
  theme: 'dark' | 'light';
  filename: string;
}

const CodeExplorer: React.FC<CodeExplorerProps> = ({ 
  code, analysis, hoveredLine, selection, onLineHover, onLineClick, onDeepDive, theme, filename
}) => {
  const lines = useMemo(() => code.split('\n'), [code]);

  const isSelected = (lineNumber: number) => {
    if (!selection) return false;
    return lineNumber >= selection.start && lineNumber <= selection.end;
  };

  return (
    <div className={`h-full flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#0b1b2b]' : 'bg-white'}`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b text-[10px] font-black uppercase tracking-[0.2em] ${
        theme === 'dark' 
          ? 'bg-[#1b263b] text-slate-400 border-[#1d2d44]' 
          : 'bg-slate-100 text-slate-700 border-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          <Terminal size={12} />
          <span>{filename}</span>
        </div>
        <div className="flex gap-2 text-[8px] font-normal lowercase tracking-normal">
          <span className={theme === 'dark' ? 'opacity-50' : 'text-slate-500 font-bold'}>Shift+Click to select range</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative py-6 code-font text-[13px] leading-relaxed">
        {lines.map((lineText, idx) => {
          const lineNumber = idx + 1;
          const isLineHovered = hoveredLine === lineNumber;
          const isLineSelected = isSelected(lineNumber);
          const explanation = analysis.per_line_explanations.find(e => e.lineNumber === lineNumber)?.explanation;
          const issue = analysis.detected_issues.find(i => i.lineNumber === lineNumber);

          return (
            <div 
              key={idx}
              className={`group relative flex cursor-pointer transition-all duration-75 border-l-4 ${
                isLineSelected 
                  ? (theme === 'dark' ? 'bg-[#64ffda]/10 border-[#64ffda]' : 'bg-sky-100 border-sky-600') 
                  : isLineHovered 
                    ? (theme === 'dark' ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-200 border-slate-400')
                    : 'border-transparent'
              }`}
              onMouseEnter={() => onLineHover(lineNumber)}
              onMouseLeave={() => onLineHover(null)}
              onClick={(e) => onLineClick(lineNumber, e.shiftKey)}
            >
              <div className={`w-14 shrink-0 text-right pr-6 select-none text-[11px] font-bold transition-colors ${
                isLineSelected 
                  ? (theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-700') 
                  : (theme === 'dark' ? 'text-slate-500/40' : 'text-slate-400')
              }`}>
                {lineNumber}
              </div>
              <div className={`flex-1 whitespace-pre pr-12 py-0.5 transition-opacity ${
                isLineSelected ? 'font-medium opacity-100' : 'opacity-80 group-hover:opacity-100'
              } ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900 font-medium'}`}>
                {lineText || ' '}
              </div>

              {isLineSelected && lineNumber === selection?.start && (
                 <div className="absolute right-4 top-0 bottom-0 flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (selection) onDeepDive(selection); }}
                      className={`p-2 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all ${theme === 'dark' ? 'bg-[#64ffda] text-black' : 'bg-sky-600 text-white'}`}
                      title="AI Deep Dive on selection"
                    >
                      <Sparkles size={14} />
                    </button>
                 </div>
              )}

              {isLineHovered && explanation && !isLineSelected && (
                <div className={`absolute left-16 -top-10 z-[100] w-72 p-4 rounded-2xl border shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 ${
                  theme === 'dark' ? 'bg-[#112240] border-[#1d2d44] text-slate-300' : 'bg-white border-slate-400 text-slate-900'
                }`}>
                   <div className={`text-[10px] font-black uppercase mb-1 tracking-widest ${theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-600'}`}>Execution Detail</div>
                   <p className="text-[11px] leading-relaxed font-medium">{explanation}</p>
                </div>
              )}
              
              {issue && !isLineSelected && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${issue.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CodeExplorer;
