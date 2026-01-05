
export interface PerLineExplanation {
  lineNumber: number;
  explanation: string;
}

export interface Keyword {
  term: string;
  definition: string;
  relevance: string;
}

export interface BestPractice {
  lineNumber: number;
  guideline: string;
}

export interface DetectedIssue {
  lineNumber: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface MermaidMapping {
  nodeId: string;
  lineNumbers: number[];
}

export interface AnalysisResponse {
  overall_program_summary: string;
  per_line_explanations: PerLineExplanation[];
  keyword_glossary: Keyword[];
  best_practices: BestPractice[];
  detected_issues: DetectedIssue[];
  mermaid_flowchart_code: string;
  node_to_line_mapping: MermaidMapping[];
}

export type SupportedLanguage = 
  | 'javascript' | 'typescript' | 'python' | 'go' | 'cpp' | 'java' | 'rust'
  | 'csharp' | 'ruby' | 'php' | 'swift' | 'kotlin' | 'shell' | 'sql' 
  | 'assembly' | 'dart' | 'r' | 'scala' | 'lua' | 'haskell' | 'zig' | 'elixir';

export interface SelectionRange {
  start: number;
  end: number;
}

export interface AppState {
  code: string;
  language: SupportedLanguage;
  programName: string;
  analysis: AnalysisResponse | null;
  isLoading: boolean;
  selection: SelectionRange | null;
  hoveredLine: number | null;
  activeTab: 'flow' | 'details' | 'issues';
  furtherExplanation: string | null;
  theme: 'dark' | 'light';
}
