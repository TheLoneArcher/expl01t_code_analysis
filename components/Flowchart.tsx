
import React, { useEffect, useRef, useState } from 'react';
import { MermaidMapping } from '../types';
import { Loader2, AlertCircle, Maximize2 } from 'lucide-react';
import mermaid from 'mermaid';

interface FlowchartProps {
  mermaidCode: string;
  mapping: MermaidMapping[];
  onNodeHover: (lineNumbers: number[]) => void;
  onNodeClick: (lineNumbers: number[]) => void;
  theme: 'dark' | 'light';
}

const Flowchart: React.FC<FlowchartProps> = ({ mermaidCode, mapping, onNodeHover, onNodeClick, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !mermaidCode) return;
      
      setIsRendering(true);
      setError(null);
      const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
      
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'neutral',
          themeVariables: theme === 'dark' ? {
            primaryColor: '#1d2d44',
            primaryTextColor: '#64ffda',
            primaryBorderColor: '#64ffda',
            lineColor: '#ccd6f6',
            secondaryColor: '#0a192f',
            tertiaryColor: '#112240',
            mainBkg: '#112240',
          } : {
            primaryColor: '#ffffff',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#334155',
            lineColor: '#1e293b',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#f1f5f9',
            mainBkg: '#ffffff',
          },
          flowchart: { 
            useMaxWidth: false,
            htmlLabels: true, 
            padding: 80,
            rankSpacing: 50,
            nodeSpacing: 50
          },
          securityLevel: 'loose',
        });

        const { svg } = await mermaid.render(id, mermaidCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          
          const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const node = target.closest('.node');
            if (node) {
              const nodeId = node.id.replace(/^flowchart-/, '').split('-')[0];
              const found = mapping.find(m => m.nodeId === nodeId);
              if (found) onNodeHover(found.lineNumbers);
            }
          };

          const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const node = target.closest('.node');
            if (node) {
              const nodeId = node.id.replace(/^flowchart-/, '').split('-')[0];
              const found = mapping.find(m => m.nodeId === nodeId);
              if (found) onNodeClick(found.lineNumbers);
            }
          };

          containerRef.current.addEventListener('mouseover', handleMouseOver);
          containerRef.current.addEventListener('click', handleClick);
        }
      } catch (err) {
        console.error("Mermaid Render Error:", err);
        setError("Logic Map Syntax Error. The generated logic was too complex to visualize.");
      } finally {
        setIsRendering(false);
      }
    };

    renderChart();
  }, [mermaidCode, mapping, onNodeHover, onNodeClick, theme]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-700'}`}>
          <Maximize2 size={12} />
          Control Flow Visualization
        </h3>
        {isRendering && <Loader2 className="animate-spin text-slate-400" size={12} />}
      </div>
      
      <div className={`flex-1 overflow-auto rounded-3xl border custom-scrollbar ${
        theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-200 border-slate-300 shadow-inner'
      }`}>
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <AlertCircle size={32} className="text-red-500 mb-2" />
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px]">{error}</p>
          </div>
        ) : (
          <div className="flex justify-start items-start min-w-full min-h-full">
            <div 
              ref={containerRef} 
              className="mermaid-container p-12 transition-all duration-300 min-h-[400px] min-w-[400px] flex justify-center" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Flowchart;
