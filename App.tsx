
import React, { useState } from 'react';
import { 
  Zap, AlertTriangle, Lightbulb, Loader2, 
  Maximize2, Sun, Moon, Edit3, Globe, Layers,
  Pencil, PlusCircle
} from 'lucide-react';
import { analyzeCode, explainFurther } from './geminiService';
import { AppState, SupportedLanguage, SelectionRange } from './types';
import CodeExplorer from './components/CodeExplorer';
import SidePanel from './components/SidePanel';
import Flowchart from './components/Flowchart';

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'shell', label: 'Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'dart', label: 'Dart' },
  { value: 'r', label: 'R' },
  { value: 'scala', label: 'Scala' },
  { value: 'lua', label: 'Lua' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'zig', label: 'Zig' },
  { value: 'elixir', label: 'Elixir' },
];

const DEFAULT_CODE = `function findMax(arr) {
  if (!arr || arr.length === 0) {
    return null;
  }
  
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  return max;
}`;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    code: DEFAULT_CODE,
    language: 'javascript',
    programName: 'Logic Explorer',
    analysis: null,
    isLoading: false,
    selection: null,
    hoveredLine: null,
    activeTab: 'flow',
    furtherExplanation: null,
    theme: 'dark'
  });

  const toggleTheme = () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme', nextTheme === 'light');
    setState(prev => ({ ...prev, theme: nextTheme }));
  };

  const handleAnalyze = async () => {
    if (!state.code.trim()) return;
    setState(prev => ({ ...prev, isLoading: true, furtherExplanation: null, selection: null }));
    try {
      const result = await analyzeCode(state.code, state.language);
      setState(prev => ({ ...prev, analysis: result, isLoading: false }));
    } catch (error) {
      console.error("Analysis failed:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert("Analysis failed. Ensure your Gemini API Key is active and the code is valid.");
    }
  };

  const handleDeepDive = async (range: SelectionRange) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const lineNumbers = [];
      for (let i = range.start; i <= range.end; i++) lineNumbers.push(i);
      const explanation = await explainFurther(state.code, lineNumbers);
      setState(prev => ({ ...prev, furtherExplanation: explanation, isLoading: false, activeTab: 'details' }));
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLineClick = (line: number, shiftKey: boolean) => {
    if (!shiftKey || !state.selection) {
      setState(prev => ({ ...prev, selection: { start: line, end: line } }));
    } else {
      const start = Math.min(state.selection.start, line);
      const end = Math.max(state.selection.start, line);
      setState(prev => ({ ...prev, selection: { start, end } }));
    }
  };

  const resetAnalysis = () => {
    setState(prev => ({ ...prev, analysis: null, furtherExplanation: null, selection: null }));
  };

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${state.theme === 'dark' ? 'bg-[#0a192f] text-[#ccd6f6]' : 'bg-[#f8fafc] text-[#1e293b]'}`}>
      <header className={`h-16 border-b shrink-0 flex items-center justify-between px-6 z-20 ${state.theme === 'dark' ? 'bg-[#112240] border-[#1d2d44]' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${state.theme === 'dark' ? 'bg-[#64ffda]/10 text-[#64ffda]' : 'bg-sky-100 text-sky-600'}`}>
            <Layers size={22} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 group">
              <input 
                className="bg-transparent text-base font-bold outline-none border-b border-transparent focus:border-[var(--accent)] transition-all"
                value={state.programName}
                onChange={e => setState(prev => ({ ...prev, programName: e.target.value }))}
                placeholder="Name your file..."
              />
              <Edit3 size={10} className="opacity-30 group-hover:opacity-100" />
            </div>
            <div className="flex items-center gap-1.5">
               <Globe size={10} className="text-slate-400" />
               <select 
                 className={`bg-transparent text-[9px] font-black uppercase tracking-wider outline-none cursor-pointer ${state.theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-600'}`}
                 value={state.language}
                 onChange={e => setState(prev => ({ ...prev, language: e.target.value as SupportedLanguage }))}
               >
                 {LANGUAGES.map(lang => (
                   <option key={lang.value} value={lang.value} className={state.theme === 'dark' ? 'bg-[#112240] text-white' : 'bg-white text-slate-900'}>{lang.label}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {state.analysis && (
            <button 
              onClick={resetAnalysis}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest ${
                state.theme === 'dark' 
                ? 'border-[#1d2d44] hover:bg-[#1d2d44] text-slate-400 hover:text-white' 
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              title="Edit Code"
            >
              <Pencil size={14} />
              Edit Code
            </button>
          )}

          <div className="w-px h-6 mx-2 bg-slate-500/20" />

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-500/10 transition-colors">
            {state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={handleAnalyze}
            disabled={state.isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 shadow-lg ${
              state.isLoading 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none' 
              : state.theme === 'dark' 
                ? 'bg-[#64ffda] text-black hover:shadow-[0_0_20px_rgba(100,255,218,0.4)]' 
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {state.isLoading ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />}
            {state.analysis ? 'RE-ANALYZE' : 'ANALYZE LOGIC'}
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className={`flex-[1.4] flex flex-col overflow-hidden rounded-2xl border transition-all ${
          state.theme === 'dark' ? 'border-[#1d2d44] bg-[#0d1b2a]' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="flex-1 overflow-hidden relative">
            {!state.analysis ? (
              <div className="h-full flex flex-col">
                <div className={`px-6 py-3 border-b flex items-center justify-between ${state.theme === 'dark' ? 'bg-[#1b263b] border-[#1d2d44]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                    <PlusCircle size={12} /> Source Input Editor
                  </span>
                  <span className="text-[9px] opacity-40 italic">Changes persist in local session</span>
                </div>
                <textarea
                  value={state.code}
                  onChange={(e) => setState(prev => ({ ...prev, code: e.target.value }))}
                  className={`flex-1 bg-transparent p-6 outline-none code-font resize-none text-sm leading-relaxed tracking-tight ${
                    state.theme === 'dark' ? 'text-slate-300 placeholder-slate-700' : 'text-slate-700 placeholder-slate-300'
                  }`}
                  placeholder={`Paste your ${state.language} code here...`}
                  autoFocus
                />
              </div>
            ) : (
              <CodeExplorer 
                code={state.code}
                analysis={state.analysis}
                hoveredLine={state.hoveredLine}
                selection={state.selection}
                onLineHover={(line) => setState(prev => ({ ...prev, hoveredLine: line }))}
                onLineClick={handleLineClick}
                onDeepDive={handleDeepDive}
                theme={state.theme}
                filename={state.programName}
              />
            )}
          </div>
          {state.analysis && (
            <div className={`h-24 p-5 overflow-y-auto border-t shrink-0 ${state.theme === 'dark' ? 'border-[#1d2d44] bg-[#112240]/40' : 'bg-slate-50 border-slate-200'}`}>
               <h3 className={`text-[9px] font-black uppercase tracking-widest mb-1.5 ${state.theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-600'}`}>Executive Summary</h3>
               <p className={`text-xs leading-relaxed italic ${state.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                 {state.analysis.overall_program_summary}
               </p>
            </div>
          )}
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden rounded-2xl border ${state.theme === 'dark' ? 'border-[#1d2d44] bg-[#112240]' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className={`h-12 flex px-4 border-b shrink-0 ${state.theme === 'dark' ? 'border-[#1d2d44]' : 'border-slate-100'}`}>
            {[
              { id: 'flow', label: 'Control Map', icon: Maximize2 },
              { id: 'details', label: 'Semantic Data', icon: Layers },
              { id: 'issues', label: 'Insights', icon: AlertTriangle }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setState(prev => ({ ...prev, activeTab: tab.id as any }))}
                className={`flex items-center gap-2 px-4 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all ${
                  state.activeTab === tab.id 
                  ? (state.theme === 'dark' ? 'border-[#64ffda] text-[#64ffda]' : 'border-sky-600 text-sky-600')
                  : 'border-transparent text-slate-500 hover:text-slate-400'
                }`}
              >
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto relative p-6 custom-scrollbar">
            {!state.analysis ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-30 animate-pulse">
                 <div className="p-8 rounded-full border-4 border-dashed border-current mb-4">
                    <Maximize2 size={40} />
                 </div>
                 <p className="text-xs font-black uppercase tracking-[0.2em]">Map Generation Pending</p>
              </div>
            ) : (
              <div className="h-full">
                {state.activeTab === 'flow' && (
                  <Flowchart 
                    mermaidCode={state.analysis.mermaid_flowchart_code} 
                    mapping={state.analysis.node_to_line_mapping}
                    onNodeHover={(lines) => setState(prev => ({ ...prev, hoveredLine: lines[0] }))}
                    onNodeClick={(lines) => setState(prev => ({ ...prev, selection: { start: lines[0], end: lines[lines.length-1] } }))}
                    theme={state.theme}
                  />
                )}
                {state.activeTab === 'details' && (
                  <SidePanel 
                    analysis={state.analysis} 
                    selection={state.selection}
                    furtherExplanation={state.furtherExplanation}
                    theme={state.theme}
                  />
                )}
                {state.activeTab === 'issues' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <section>
                      <h3 className="flex items-center gap-2 text-[10px] font-black text-red-500 mb-4 uppercase tracking-widest">
                        <AlertTriangle size={14} /> Critical Risks
                      </h3>
                      {state.analysis.detected_issues.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No vulnerabilities detected.</p>
                      ) : state.analysis.detected_issues.map((issue, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border mb-3 ${state.theme === 'dark' ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
                           <span className="text-[9px] font-black text-red-500 block mb-1 uppercase tracking-tighter">L{issue.lineNumber} • {issue.severity} Priority</span>
                           <p className={`text-[11px] leading-relaxed ${state.theme === 'dark' ? 'text-red-200/70' : 'text-red-900/70'}`}>{issue.description}</p>
                        </div>
                      ))}
                    </section>
                    <section>
                      <h3 className={`flex items-center gap-2 text-[10px] font-black mb-4 uppercase tracking-widest ${state.theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-600'}`}>
                        <Lightbulb size={14} /> Optimizations
                      </h3>
                      {state.analysis.best_practices.map((bp, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border mb-3 ${state.theme === 'dark' ? 'bg-[#64ffda]/5 border-[#64ffda]/20' : 'bg-sky-50 border-sky-100'}`}>
                           <span className={`text-[9px] font-black block mb-1 uppercase tracking-tighter ${state.theme === 'dark' ? 'text-[#64ffda]' : 'text-sky-600'}`}>L{bp.lineNumber} Best Practice</span>
                           <p className={`text-[11px] leading-relaxed ${state.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{bp.guideline}</p>
                        </div>
                      ))}
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
