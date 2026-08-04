// bizlaw-g3/src/App.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { modules } from './data/modules';
import { glossary } from './data/glossary';
import { Quiz } from './components/Quiz';
import { TermText } from './components/TermGlossary';
import { ExamGuide } from './components/ExamGuide';
import { buildUsecaseHtml } from './data/usecaseGuide';
import { chapterNames } from './data/chapters';
import { ChevronLeft, Book, LayoutDashboard, ArrowRight, Search as SearchIcon, X, Target, Trash2, Shuffle, CheckCircle2, XCircle, ChevronUp, ListOrdered, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROGRESS_KEY = 'bizlaw-g3-progress';

// 行頭の絵文字マーカーは装飾でなくテキストラベルへ（2026-08-05・O-2-8）。prerender.ts と同じ変換。
const LINE_MARKERS: Record<string, string> = {
  '💡': 'ヒント',
  '🎯': '試験ポイント',
  '⚠️': '注意',
  '📌': 'まとめ',
  '📖': '発展',
};
// 見出しは見出し文自体が既に意味を伝えるため、絵文字だけ剥がす（ラベル追加はしない）。
function stripLeadingMarker(text: string): string {
  const markerKey = Object.keys(LINE_MARKERS).find((mk) => text.startsWith(mk));
  return markerKey ? text.slice(markerKey.length).trim() : text;
}

const chapterColors: Record<number, { bg: string; text: string; accent: string; light: string }> = {
  1: { bg: '#dbeafe', text: '#1e3a8a', accent: '#1d4ed8', light: '#eff6ff' },
  2: { bg: '#e0f2fe', text: '#075985', accent: '#0369a1', light: '#f0f9ff' },
  3: { bg: '#d1fae5', text: '#065f46', accent: '#059669', light: '#ecfdf5' },
  4: { bg: '#fef3c7', text: '#92400e', accent: '#d97706', light: '#fffbeb' },
  5: { bg: '#ede9fe', text: '#5b21b6', accent: '#7c3aed', light: '#f5f3ff' },
  6: { bg: '#fce7f3', text: '#9d174d', accent: '#db2777', light: '#fdf2f8' },
};

interface ProgressEntry { score: number; total: number; completedAt: string; }
type Progress = Record<string, ProgressEntry>;

function loadProgress(): Progress {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); } catch { return {}; }
}
function saveProgress(p: Progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

type View = 'dashboard' | 'glossary' | 'randomquiz' | 'privacy' | 'about' | 'guide' | 'usecase' | 'not-found';

function App() {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  // Random quiz state
  const [rqQuestions, setRqQuestions] = useState<{ q: typeof modules[0]['quiz'][0]; moduleTitle: string; moduleId: string }[]>([]);
  const [rqIdx, setRqIdx] = useState(0);
  const [rqSelected, setRqSelected] = useState<number | null>(null);
  const [rqIsCorrect, setRqIsCorrect] = useState<boolean | null>(null);
  const [rqResults, setRqResults] = useState<{ moduleId: string; moduleTitle: string; correct: boolean }[]>([]);
  const [rqDone, setRqDone] = useState(false);

  const startRandomQuiz = useCallback(() => {
    // 各モジュールから2問ずつ無作為抽出→全体をシャッフル（合計36問）
    const qs = modules.flatMap(m => {
      const shuffled = [...m.quiz].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2).map(q => ({ q, moduleTitle: m.title, moduleId: m.id }));
    }).sort(() => Math.random() - 0.5);
    setRqQuestions(qs);
    setRqIdx(0);
    setRqSelected(null);
    setRqIsCorrect(null);
    setRqResults([]);
    setRqDone(false);
    setView('randomquiz');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const rqHandleSelect = (idx: number) => {
    if (rqSelected !== null) return;
    setRqSelected(idx);
    const correct = idx === rqQuestions[rqIdx].q.correctAnswer;
    setRqIsCorrect(correct);
  };

  const rqNext = () => {
    const cur = rqQuestions[rqIdx];
    const correct = rqSelected === cur.q.correctAnswer;
    const newResults = [...rqResults, { moduleId: cur.moduleId, moduleTitle: cur.moduleTitle, correct }];
    if (rqIdx + 1 < rqQuestions.length) {
      setRqResults(newResults);
      setRqIdx(rqIdx + 1);
      setRqSelected(null);
      setRqIsCorrect(null);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setRqResults(newResults);
      setRqDone(true);
      const correctCount = newResults.filter(r => r.correct).length;
      const entry: ProgressEntry = { score: correctCount, total: newResults.length, completedAt: new Date().toLocaleDateString('ja-JP') };
      const next = { ...loadProgress(), 'random-quiz': entry };
      saveProgress(next);
      setProgress(next);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const updateModuleId = useCallback((id: string | null) => {
    const basePath = window.location.pathname.startsWith('/bizlaw-g3/') ? '/bizlaw-g3' : '';
    const newPath = id ? `${basePath}/${id}/` : `${basePath}/`;
    window.history.pushState(null, '', newPath);

    if (!id) {
      setActiveModuleId(null);
      setView('dashboard');
    } else {
      setActiveModuleId(id);
      setView('dashboard');
    }
    setQuizCompleted(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const switchView = useCallback((newView: View) => {
    setActiveModuleId(null);
    setView(newView);
    const basePath = window.location.pathname.startsWith('/bizlaw-g3/') ? '/bizlaw-g3' : '';
    const newPath = newView === 'dashboard' ? `${basePath}/` : `${basePath}/${newView}/`;
    window.history.pushState(null, '', newPath);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleResetProgress = useCallback(() => {
    if (window.confirm('学習進捗をすべてリセットしますか？\nこの操作は元に戻せません。')) {
      saveProgress({});
      setProgress({});
    }
  }, []);

  const handleQuizComplete = useCallback((moduleId: string, score: number, total: number) => {
    setQuizCompleted(true);
    const entry: ProgressEntry = { score, total, completedAt: new Date().toLocaleDateString('ja-JP') };
    const next = { ...loadProgress(), [moduleId]: entry };
    saveProgress(next);
    setProgress(next);
  }, []);

  useEffect(() => {
    const handlePath = () => {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];

      const isCustomView = ['glossary', 'privacy', 'about', 'guide', 'randomquiz', 'usecase'].includes(lastSegment || '');

      if (isCustomView) {
        setView(lastSegment as View);
        setActiveModuleId(null);
        if (lastSegment === 'privacy') document.title = 'プライバシーポリシー | ビジネス実務法務検定 3級 学習リファレンス';
        else if (lastSegment === 'about') document.title = 'サイトについて | ビジネス実務法務検定 3級 学習リファレンス';
        else if (lastSegment === 'guide') document.title = '試験ガイド | ビジネス実務法務検定 3級 学習リファレンス';
        else if (lastSegment === 'usecase') document.title = '場面から引く 法務逆引きガイド | ビジネス実務法務検定 3級 学習リファレンス';
      } else if (lastSegment && lastSegment !== 'bizlaw-g3') {
        const found = modules.find(m => m.id === lastSegment);
        if (found) {
          setActiveModuleId(found.id);
          setView('dashboard');
          document.title = `${found.title} | ビジネス実務法務検定 3級 学習リファレンス`;
        } else {
          setActiveModuleId(null);
          setView('not-found');
          document.title = 'ページが見つかりません | ビジネス実務法務検定 3級 学習リファレンス';
        }
      } else {
        setActiveModuleId(null);
        setView('dashboard');
        document.title = 'ビジネス実務法務検定 3級 学習リファレンス';
      }
    };
    handlePath();
    window.addEventListener('popstate', handlePath);
    return () => window.removeEventListener('popstate', handlePath);
  }, []);

  const parseInlineContent = useCallback((text: string): React.ReactNode => {
    function parseInline(t: string): React.ReactNode {
      const regex = /(\*\*[\s\S]*?\*\*|\[\[term:.*?\]\][\s\S]*?\[\[\/term\]\]|\[\[org-structure\]\]|\[\[dispute-resolution\]\]|\[\[bankruptcy-branch\]\]|\[\[secured-parties\]\])/g;
      const parts = t.split(regex);
      return (
        <>
          {parts.map((part, i) => {
            if (!part) return null;
            const key = `inline-${i}`;
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{parseInline(part.slice(2, -2))}</strong>;
            if (part.startsWith('[[term:')) {
              const idMatch = part.match(/\[\[term:(.*?)\]\]/);
              const contentMatch = part.match(/\]\]([\s\S]*?)\[\[\/term\]\]/);
              if (idMatch && contentMatch) return <TermText key={key} termId={idMatch[1]} onNavigate={updateModuleId} renderText={parseInline}>{contentMatch[1]}</TermText>;
            }
            if (part === '[[org-structure]]') return (
              <figure key={key} className="bl-figure">
                <svg viewBox="0 0 340 254" role="img" aria-label="株式会社の機関設計：株主総会が取締役・監査役を選任し、取締役会が代表取締役を選定、監査役が取締役の職務執行を監査する関係図" className="bl-fig-svg">
                  <rect x={95} y={14} width={150} height={42} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={170} y={34} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--primary-text)">株主総会</text>
                  <text x={170} y={49} textAnchor="middle" fontSize={9} fill="var(--text-muted)">（最高意思決定機関）</text>

                  <line x1={170} y1={56} x2={170} y2={76} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={91} y1={76} x2={265} y2={76} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={91} y1={76} x2={91} y2={108} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={265} y1={76} x2={265} y2={108} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="91,112 87,105 95,105" fill="#94a3b8" />
                  <polygon points="265,112 261,105 269,105" fill="#94a3b8" />
                  <text x={170} y={70} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--text-muted)">取締役・監査役を選任</text>

                  <rect x={16} y={112} width={150} height={42} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={91} y={130} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--text)">取締役会</text>
                  <text x={91} y={145} textAnchor="middle" fontSize={8} fill="var(--text-muted)">（業務執行の決定・監督）</text>

                  <rect x={190} y={112} width={150} height={42} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={265} y={130} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--text)">監査役（会）</text>
                  <text x={265} y={145} textAnchor="middle" fontSize={8} fill="var(--text-muted)">（取締役の職務執行を監査）</text>

                  <line x1={91} y1={154} x2={91} y2={198} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="91,202 87,195 95,195" fill="#94a3b8" />
                  <text x={99} y={180} fontSize={9} fontWeight={700} fill="var(--text-muted)">選定・解職</text>

                  <rect x={16} y={202} width={150} height={42} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={91} y={220} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--primary-text)">代表取締役</text>
                  <text x={91} y={235} textAnchor="middle" fontSize={8} fill="var(--text-muted)">（会社を代表し業務執行）</text>

                  <line x1={190} y1={133} x2={172} y2={133} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="3 2" />
                  <polygon points="168,133 175,129 175,137" fill="var(--accent)" />
                  <text x={179} y={123} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="var(--accent)">監査</text>
                </svg>
                <figcaption className="bl-fig-cap">
                  株式会社の機関設計。<strong>株主総会</strong>が取締役・監査役を選任・解任し、<strong>取締役会</strong>がその中から<strong>代表取締役</strong>を選定して会社の代表・業務執行を委ねる。<strong>監査役（会）</strong>は株主総会から独立した立場で選任され、取締役の職務執行が適法かどうかを監査する（点線）。「誰が誰を選ぶか」と「誰が誰を監査するか」の向きを混同しないことが試験のポイント。
                </figcaption>
              </figure>
            );
            if (part === '[[dispute-resolution]]') return (
              <figure key={key} className="bl-figure">
                <svg viewBox="0 0 380 250" role="img" aria-label="紛争解決の方法の分岐：訴訟とADR、ADRはさらに調停と仲裁に分かれる" className="bl-fig-svg">
                  <rect x={95} y={14} width={150} height={38} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={170} y={38} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--primary-text)">紛争解決の方法</text>

                  <line x1={170} y1={52} x2={170} y2={72} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={91} y1={72} x2={265} y2={72} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={91} y1={72} x2={91} y2={104} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={265} y1={72} x2={265} y2={104} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="91,108 87,101 95,101" fill="#94a3b8" />
                  <polygon points="265,108 261,101 269,101" fill="#94a3b8" />

                  <rect x={16} y={108} width={150} height={42} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={91} y={126} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--text)">訴訟</text>
                  <text x={91} y={141} textAnchor="middle" fontSize={7.5} fill="var(--text-muted)">（強制執行可・公開・三審制）</text>

                  <rect x={190} y={108} width={150} height={42} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={265} y={124} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--text)">ADR（裁判外紛争解決）</text>
                  <text x={265} y={139} textAnchor="middle" fontSize={7.5} fill="var(--text-muted)">（調停・仲裁など）</text>

                  <line x1={265} y1={150} x2={265} y2={164} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={210} y1={164} x2={320} y2={164} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={210} y1={164} x2={210} y2={196} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={320} y1={164} x2={320} y2={196} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="210,200 206,193 214,193" fill="#94a3b8" />
                  <polygon points="320,200 316,193 324,193" fill="#94a3b8" />

                  <rect x={165} y={200} width={90} height={42} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={210} y={218} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--primary-text)">調停</text>
                  <text x={210} y={233} textAnchor="middle" fontSize={7} fill="var(--text-muted)">（合意が前提）</text>

                  <rect x={275} y={200} width={90} height={42} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={320} y={218} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--primary-text)">仲裁</text>
                  <text x={320} y={233} textAnchor="middle" fontSize={7} fill="var(--text-muted)">（判断に従う義務）</text>
                </svg>
                <figcaption className="bl-fig-cap">
                  紛争解決の方法は、まず<strong>訴訟</strong>と<strong>ADR（裁判外紛争解決手続）</strong>に分かれる。訴訟は裁判所が判決を下し強制執行までできる最も強制力の強い手段だが、公開審理・三審制で時間もかかる。ADRはさらに<strong>調停</strong>（当事者の合意が前提で、不成立なら訴訟に進める）と<strong>仲裁</strong>（仲裁人の判断に当事者が従う義務があり、原則一審制で不服申立てができない）に分かれる。「話し合いで決めるか、第三者に決めてもらうか」がこの分岐の軸。
                </figcaption>
              </figure>
            );
            if (part === '[[bankruptcy-branch]]') return (
              <figure key={key} className="bl-figure">
                <svg viewBox="0 0 380 250" role="img" aria-label="倒産手続きの分岐：清算型の破産と、再建型の民事再生・会社更生" className="bl-fig-svg">
                  <rect x={95} y={14} width={150} height={38} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={170} y={38} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--primary-text)">倒産手続き</text>

                  <line x1={170} y1={52} x2={170} y2={68} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={91} y1={68} x2={265} y2={68} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={91} y1={68} x2={91} y2={100} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={265} y1={68} x2={265} y2={100} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="91,104 87,97 95,97" fill="#94a3b8" />
                  <polygon points="265,104 261,97 269,97" fill="#94a3b8" />

                  <rect x={16} y={104} width={150} height={54} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={91} y={124} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--text)">清算型：破産</text>
                  <text x={91} y={138} textAnchor="middle" fontSize={7} fill="var(--text-muted)">（破産管財人が管理）</text>
                  <text x={91} y={150} textAnchor="middle" fontSize={7} fill="var(--text-muted)">（法人格が消滅）</text>

                  <rect x={190} y={104} width={150} height={38} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={265} y={122} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--text)">再建型</text>
                  <text x={265} y={136} textAnchor="middle" fontSize={7.5} fill="var(--text-muted)">（事業を続けながら再建）</text>

                  <line x1={265} y1={142} x2={265} y2={158} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={210} y1={158} x2={320} y2={158} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={210} y1={158} x2={210} y2={188} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={320} y1={158} x2={320} y2={188} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="210,192 206,185 214,185" fill="#94a3b8" />
                  <polygon points="320,192 316,185 324,185" fill="#94a3b8" />

                  <rect x={165} y={192} width={90} height={50} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={210} y={210} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--primary-text)">民事再生</text>
                  <text x={210} y={224} textAnchor="middle" fontSize={6.5} fill="var(--text-muted)">（現経営者が続投）</text>
                  <text x={210} y={235} textAnchor="middle" fontSize={6.5} fill="var(--text-muted)">（法人・個人とも可）</text>

                  <rect x={275} y={192} width={90} height={50} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={320} y={210} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="var(--primary-text)">会社更生</text>
                  <text x={320} y={224} textAnchor="middle" fontSize={6.5} fill="var(--text-muted)">（更生管財人が管理）</text>
                  <text x={320} y={235} textAnchor="middle" fontSize={6.5} fill="var(--text-muted)">（株式会社のみ）</text>
                </svg>
                <figcaption className="bl-fig-cap">
                  倒産手続きは、会社を解体して財産を配当する<strong>清算型（破産）</strong>と、事業を続けながら立て直す<strong>再建型</strong>に大別される。再建型はさらに、現経営者が経営を続けながら再建計画を進める<strong>民事再生</strong>（DIP型・法人個人とも利用可）と、経営者を排除し更生管財人が管理する<strong>会社更生</strong>（株式会社のみ）に分かれる。「会社を畳むか続けるか」「続けるなら経営者は残るか」という2段階の分岐で3手続きの位置関係が整理できる。
                </figcaption>
              </figure>
            );
            if (part === '[[secured-parties]]') return (
              <figure key={key} className="bl-figure">
                <svg viewBox="0 0 340 210" role="img" aria-label="担保をめぐる三者関係：債権者・主債務者・物上保証人" className="bl-fig-svg">
                  <rect x={115} y={14} width={110} height={42} rx={6} fill="var(--primary-light)" stroke="var(--primary)" strokeWidth={1.6} />
                  <text x={170} y={34} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--primary-text)">債権者</text>
                  <text x={170} y={49} textAnchor="middle" fontSize={8} fill="var(--text-muted)">（お金を貸した人）</text>

                  <line x1={170} y1={56} x2={170} y2={74} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={81} y1={74} x2={259} y2={74} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={81} y1={74} x2={81} y2={108} stroke="#94a3b8" strokeWidth={1.4} />
                  <line x1={259} y1={74} x2={259} y2={108} stroke="#94a3b8" strokeWidth={1.4} />
                  <polygon points="81,112 77,105 85,105" fill="#94a3b8" />
                  <polygon points="259,112 255,105 263,105" fill="#94a3b8" />
                  <text x={45} y={95} fontSize={7.5} fontWeight={700} fill="var(--text-muted)">返済義務</text>
                  <text x={259} y={90} textAnchor="middle" fontSize={7} fontWeight={700} fill="var(--text-muted)">担保提供のみ</text>
                  <text x={259} y={100} textAnchor="middle" fontSize={6.5} fill="var(--text-muted)">（債務は負わない）</text>

                  <rect x={16} y={112} width={130} height={46} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={81} y={132} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--text)">主債務者</text>
                  <text x={81} y={147} textAnchor="middle" fontSize={7.5} fill="var(--text-muted)">（お金を借りた人）</text>

                  <rect x={194} y={112} width={130} height={46} rx={6} fill="var(--bg-warm)" stroke="var(--border-medium)" strokeWidth={1.4} />
                  <text x={259} y={130} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--text)">物上保証人</text>
                  <text x={259} y={145} textAnchor="middle" fontSize={6.5} fill="var(--text-muted)">（自分の不動産を担保に出す人）</text>

                  <line x1={259} y1={158} x2={259} y2={178} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="3 2" />
                  <line x1={259} y1={178} x2={81} y2={178} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="3 2" />
                  <line x1={81} y1={178} x2={81} y2={162} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="3 2" />
                  <polygon points="81,158 77,165 85,165" fill="var(--accent)" />
                  <text x={170} y={194} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="var(--accent)">肩代わりしたら求償権</text>
                </svg>
                <figcaption className="bl-fig-cap">
                  抵当権・質権は、お金を借りた本人（<strong>主債務者</strong>）だけでなく、<strong>第三者が自分の財産を担保に差し出す</strong>形でも設定できる（民法369条1項「債務者又は第三者」）。この第三者を<strong>物上保証人</strong>という。物上保証人は自分の不動産に抵当権を設定するだけで、主債務者の借金そのものを負うわけではない。ただし主債務者が返済できなければ、債権者はその不動産から回収する（担保権の実行）。物上保証人が肩代わりして弁済したときは、主債務者に対して<strong>求償権</strong>（返してもらう権利）を持つ（民法351条・372条で抵当権に準用）。
                </figcaption>
              </figure>
            );
            return <span key={key} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
          })}
        </>
      );
    }
    return parseInline(text);
  }, [updateModuleId]);

  const parseContent = useCallback((text: string): React.ReactNode => {
    if (!text) return null;
    const lines = text.split('\n');
    const result: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let currentOList: React.ReactNode[] = [];
    let tableLines: string[] = [];
    let h2Counter = 0;

    const flushList = (key: string) => {
      if (currentList.length > 0) {
        result.push(<ul key={`list-${key}`}>{currentList}</ul>);
        currentList = [];
      }
    };
    const flushOList = (key: string) => {
      if (currentOList.length > 0) {
        result.push(<ol key={`olist-${key}`}>{currentOList}</ol>);
        currentOList = [];
      }
    };
    const flushTable = (key: string) => {
      if (tableLines.length < 2) { tableLines = []; return; }
      const rows = tableLines.map(r =>
        r.split('|').slice(1, -1).map(cell => cell.trim())
      );
      const isSep = (r: string[]) => r.every(c => /^[-:]+$/.test(c));
      const headerRow = rows[0];
      const dataRows = rows.slice(1).filter(r => !isSep(r));
      result.push(
        <div key={`table-${key}`} className="content-table-wrap">
          <table className="content-table">
            <thead>
              <tr>{headerRow.map((cell, ci) => <th key={ci}>{parseInlineContent(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{parseInlineContent(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableLines = [];
    };

    lines.forEach((line, lineIdx) => {
      const trimmedLine = line.trim();
      const key = `line-${lineIdx}`;

      if (trimmedLine.startsWith('|')) {
        flushList(key); flushOList(key);
        tableLines.push(trimmedLine);
        return;
      }
      if (tableLines.length > 0) { flushTable(key); }

      if (trimmedLine.startsWith('#### ')) { flushList(key); flushOList(key); result.push(<h4 key={key} className="content-h4">{parseInlineContent(stripLeadingMarker(trimmedLine.slice(5)))}</h4>); return; }
      if (trimmedLine.startsWith('### ')) { flushList(key); flushOList(key); result.push(<h3 key={key} className="content-h3">{parseInlineContent(stripLeadingMarker(trimmedLine.slice(4)))}</h3>); return; }
      if (trimmedLine.startsWith('## ')) { flushList(key); flushOList(key); const sectionId = `section-${h2Counter++}`; result.push(<h2 key={key} id={sectionId} className="content-h2">{parseInlineContent(stripLeadingMarker(trimmedLine.slice(3)))}</h2>); return; }
      if (trimmedLine.startsWith('---')) { flushList(key); flushOList(key); result.push(<hr key={key} className="content-hr" />); return; }
      if (trimmedLine.startsWith('- ')) { flushOList(key); currentList.push(<li key={`li-${lineIdx}`}>{parseInlineContent(trimmedLine.slice(2))}</li>); return; }
      const olMatch = trimmedLine.match(/^(\d+)\. (.+)/);
      if (olMatch) { flushList(key); currentOList.push(<li key={`oli-${lineIdx}`}>{parseInlineContent(olMatch[2])}</li>); return; }
      if (trimmedLine === '') { flushList(key); flushOList(key); return; }
      flushList(key); flushOList(key);
      const markerKey = Object.keys(LINE_MARKERS).find((mk) => trimmedLine.startsWith(mk));
      if (markerKey) {
        const rest = trimmedLine.slice(markerKey.length).trim();
        result.push(<p key={key} className="content-p"><strong style={{ color: '#2563eb' }}>{LINE_MARKERS[markerKey]}：</strong>{parseInlineContent(rest)}</p>);
        return;
      }
      result.push(<p key={key} className="content-p">{parseInlineContent(line)}</p>);
    });
    flushTable('final');
    flushList('final');
    flushOList('final');
    return <>{result}</>;
  }, [parseInlineContent]);

  const filteredModules = useMemo(() => {
    if (!searchQuery) return modules;
    const q = searchQuery.toLowerCase();
    return modules.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeModule = useMemo(() => modules.find(m => m.id === activeModuleId), [activeModuleId]);
  const nextModule = useMemo(() => {
    if (!activeModuleId) return null;
    const idx = modules.findIndex(m => m.id === activeModuleId);
    return idx >= 0 && idx < modules.length - 1 ? modules[idx + 1] : null;
  }, [activeModuleId]);

  // モジュール目次（h2 見出しを抽出）
  const tocItems = useMemo(() => {
    if (!activeModule) return [];
    const items: { id: string; text: string }[] = [];
    let counter = 0;
    for (const line of activeModule.content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
        items.push({
          id: `section-${counter++}`,
          text: trimmed.slice(3).replace(/\*\*/g, '').trim(),
        });
      }
    }
    return items;
  }, [activeModule]);

  // スクロール進捗とトップ戻るボタン
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (!activeModuleId) {
      setScrollProgress(0);
      setShowBackToTop(false);
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 500);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeModuleId]);

  const completedCount = modules.filter(m => progress[m.id]).length;
  const totalModules = modules.length;

  return (
    <div className="container" style={{ maxWidth: activeModuleId ? '800px' : view === 'glossary' ? '1000px' : '800px' }}>
      <header className="header">
        <div className="brand" onClick={() => updateModuleId(null)}>
          <Scale className="brand-icon" strokeWidth={1.5} />
          <h1 className="title">ビジネス実務法務検定 3級</h1>
        </div>
        <p className="subtitle">企業法務　学習リファレンス</p>
        <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.05em' }}>全{modules.length}モジュール・{modules.reduce((s, m) => s + m.quiz.length, 0)}問クイズ・用語集で合格をサポート</p>
      </header>

      {!activeModuleId && (
        <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => switchView('dashboard')} className={`nav-tab ${view === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> ロードマップ
            {completedCount > 0 && <span className="nav-progress-badge">{completedCount}/{totalModules}</span>}
          </button>
          {completedCount > 0 && (
            <button onClick={handleResetProgress} className="nav-tab" style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }} title="学習進捗をリセット">
              <Trash2 size={14} /> リセット
            </button>
          )}
          <button onClick={() => switchView('glossary')} className={`nav-tab ${view === 'glossary' ? 'active' : ''}`}>
            <Book size={18} /> 用語集
          </button>
          <button onClick={startRandomQuiz} className={`nav-tab ${view === 'randomquiz' ? 'active' : ''}`}>
            <Shuffle size={18} /> 全範囲クイズ
          </button>
          <button onClick={() => switchView('guide')} className={`nav-tab ${view === 'guide' ? 'active' : ''}`}>
            <Target size={18} /> 試験ガイド
          </button>
          <button onClick={() => switchView('usecase')} className={`nav-tab ${view === 'usecase' ? 'active' : ''}`}>
            <Scale size={18} /> 逆引きガイド
          </button>
        </nav>
      )}

      <main>
        <AnimatePresence mode="wait">
          {activeModuleId ? (
            <motion.div key={activeModuleId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <button className="btn-back" onClick={() => updateModuleId(null)}><ChevronLeft size={18} /> 一覧に戻る</button>
              <div
                className="scroll-progress"
                style={{
                  width: `${scrollProgress}%`,
                  background: chapterColors[activeModule?.chapter ?? 1].accent,
                }}
              />
              <div
                className="card"
                style={{
                  borderTop: `4px solid ${chapterColors[activeModule?.chapter ?? 1].accent}`,
                  '--ch-accent': chapterColors[activeModule?.chapter ?? 1].accent,
                } as React.CSSProperties}
              >
                <span style={{
                  background: chapterColors[activeModule?.chapter ?? 1].bg,
                  color: chapterColors[activeModule?.chapter ?? 1].text,
                  fontSize: '0.6875rem', fontWeight: 700,
                  padding: '3px 10px', borderRadius: '9999px',
                  display: 'inline-block', marginBottom: '0.5rem',
                }}>Chapter {activeModule?.chapter}：{chapterNames[activeModule?.chapter ?? 1]}</span>
                <h2 style={{ marginTop: '0.5rem' }}>{parseContent(activeModule?.title || '')}</h2>
                {tocItems.length > 2 && (
                  <details className="module-toc" open>
                    <summary>
                      <ListOrdered size={14} />
                      このモジュールの目次（{tocItems.length}セクション）
                    </summary>
                    <ol>
                      {tocItems.map(item => (
                        <li key={item.id}>
                          <a href={`#${item.id}`}>{item.text}</a>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                <div className="content-body">{activeModule && parseContent(activeModule.content)}</div>
                <div className="module-bottom-nav">
                  <button
                    className="btn-back-to-list"
                    onClick={() => updateModuleId(null)}
                  >
                    <ChevronLeft size={16} /> モジュール一覧へ
                  </button>
                  {nextModule && (
                    <button
                      className="btn-next-module"
                      onClick={() => updateModuleId(nextModule.id)}
                    >
                      次のモジュール：{nextModule.title} <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
              <button
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ background: chapterColors[activeModule?.chapter ?? 1].accent }}
                aria-label="ページトップへ戻る"
              >
                <ChevronUp size={22} />
              </button>
              <div style={{ marginTop: '2rem' }}>
                <Quiz
                  key={activeModuleId}
                  questions={activeModule?.quiz || []}
                  onComplete={(score, total) => handleQuizComplete(activeModuleId, score, total)}
                  renderContent={parseContent}
                />
              </div>
              {quizCompleted && (
                <div style={{ marginTop: '1rem' }}>
                  {activeModuleId && progress[activeModuleId] && (
                    <div className="score-banner">
                      {progress[activeModuleId].score} / {progress[activeModuleId].total} 問正解
                      {progress[activeModuleId].score === progress[activeModuleId].total && ' パーフェクト！'}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <button className="btn" onClick={() => updateModuleId(null)} style={{ flex: 1, background: '#f1f5f9', color: 'var(--text)', border: '1px solid #e2e8f0' }}>
                      <ChevronLeft size={16} /> 一覧に戻る
                    </button>
                    {nextModule && (
                      <button className="btn" onClick={() => updateModuleId(nextModule.id)} style={{ flex: 2 }}>
                        次のモジュールへ：{nextModule.title} <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ) : view === 'randomquiz' ? (
            <motion.div key="rq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button className="btn-back" onClick={() => switchView('dashboard')}><ChevronLeft size={18} /> 一覧に戻る</button>
              {rqDone ? (
                <div>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {rqResults.filter(r => r.correct).length} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {rqResults.length} 問正解</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>全範囲クイズ完了</p>
                  </div>
                  {(() => {
                    const byModule: Record<string, { title: string; correct: number; total: number }> = {};
                    rqResults.forEach(r => {
                      if (!byModule[r.moduleId]) byModule[r.moduleId] = { title: r.moduleTitle, correct: 0, total: 0 };
                      byModule[r.moduleId].total++;
                      if (r.correct) byModule[r.moduleId].correct++;
                    });
                    const weak = Object.entries(byModule).filter(([, v]) => v.correct < v.total);
                    return (
                      <div className="card">
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>モジュール別結果</h3>
                        {Object.entries(byModule).map(([id, v]) => (
                          <div key={id} className="rq-result-row">
                            <span className={`rq-result-dot ${v.correct === v.total ? 'ok' : 'ng'}`} />
                            <span style={{ flex: 1, fontSize: '0.85rem' }}>{v.title}</span>
                            <span style={{ fontSize: '0.8rem', color: v.correct === v.total ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{v.correct}/{v.total}</span>
                          </div>
                        ))}
                        {weak.length > 0 && (
                          <div style={{ marginTop: '1.25rem' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>復習が必要なモジュール：</p>
                            <div className="links-row">
                              {weak.map(([id, v]) => (
                                <button key={id} className="btn-link" onClick={() => updateModuleId(id)}>
                                  {v.title} <ArrowRight size={12} />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <button className="btn" onClick={startRandomQuiz} style={{ marginTop: '0.5rem' }}>
                    <Shuffle size={16} /> もう一度
                  </button>
                </div>
              ) : rqQuestions.length > 0 ? (
                <div className="card" style={{ border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>全範囲クイズ</h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{rqQuestions[rqIdx].moduleTitle}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rqIdx + 1} / {rqQuestions.length}
                    </span>
                  </div>
                  <div style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 600, lineHeight: 1.6 }}>
                    {parseContent(rqQuestions[rqIdx].q.question)}
                  </div>
                  <div className="quiz-options">
                    {rqQuestions[rqIdx].q.options.map((opt, i) => (
                      <button
                        key={`rq-${rqIdx}-${i}`}
                        className="btn"
                        style={{
                          background: rqSelected === i ? (i === rqQuestions[rqIdx].q.correctAnswer ? '#22c55e' : '#ef4444') : '#ffffff',
                          color: rqSelected === i ? 'white' : 'var(--text)',
                          justifyContent: 'space-between',
                          border: rqSelected === i ? 'none' : '1px solid #e2e8f0',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          boxShadow: 'none',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                        }}
                        onClick={() => rqHandleSelect(i)}
                      >
                        <div style={{ flex: 1 }}>{parseContent(opt)}</div>
                        {rqSelected === i && (i === rqQuestions[rqIdx].q.correctAnswer ? <CheckCircle2 size={18} /> : <XCircle size={18} />)}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {rqSelected !== null && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                          <strong style={{ color: rqIsCorrect ? '#22c55e' : '#ef4444' }}>{rqIsCorrect ? '正解！' : '不正解...'}</strong><br />
                          {parseContent(rqQuestions[rqIdx].q.explanation)}
                        </p>
                        <button className="btn" style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1rem' }} onClick={rqNext}>
                          {rqIdx + 1 < rqQuestions.length ? '次の問題へ' : '結果を見る'} <ArrowRight size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="card" style={{ border: '1px solid #e2e8f0', textAlign: 'center', padding: '2rem' }}>
                  <Shuffle size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                  <h3 style={{ marginBottom: '0.5rem' }}>全範囲クイズ</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>全モジュールからランダムに出題します。</p>
                  <button className="btn" onClick={startRandomQuiz} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                    <Shuffle size={16} /> クイズを始める
                  </button>
                </div>
              )}
            </motion.div>
          ) : view === 'dashboard' ? (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!searchQuery && completedCount > 0 && (() => {
                const overallPct = Math.round((completedCount / totalModules) * 100);
                const nextToStudy = modules.find(m => !progress[m.id]) ?? null;
                return (
                  <div className="progress-strip">
                    <span className="progress-strip-stat">
                      {completedCount}/{totalModules}　<span className="pct">{overallPct}%</span>
                    </span>
                    <div className="progress-strip-bar">
                      <div className="progress-strip-bar-fill" style={{ width: `${overallPct}%` }} />
                    </div>
                    {nextToStudy && (
                      <span
                        className="progress-strip-next"
                        onClick={() => updateModuleId(nextToStudy.id)}
                        style={{ '--ch-accent': chapterColors[nextToStudy.chapter].accent } as React.CSSProperties}
                      >
                        次へ：{nextToStudy.title} <ArrowRight size={12} />
                      </span>
                    )}
                  </div>
                );
              })()}

              <div className="search-container">
                <div className="search-input-wrapper">
                  <SearchIcon size={18} className="search-icon" />
                  <input type="text" placeholder="トピックを検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="search-clear"><X size={16} /></button>}
                </div>
              </div>
              <div className="roadmap-grid">
                {filteredModules.reduce<React.ReactNode[]>((acc, m, idx) => {
                  const prev = filteredModules[idx - 1];
                  const cc = chapterColors[m.chapter] ?? chapterColors[1];
                  if (!prev || prev.chapter !== m.chapter) {
                    if (prev) acc.push(<div key={`ch-end-${prev.chapter}`} style={{ marginBottom: '1.5rem' }} />);
                    const chMods = modules.filter(x => x.chapter === m.chapter);
                    const chDone = chMods.filter(x => progress[x.id]).length;
                    const chPct = chMods.length > 0 ? (chDone / chMods.length) * 100 : 0;
                    acc.push(
                      <div key={`ch-${m.chapter}`} id={`ch-section-${m.chapter}`} className="chapter-header"
                        style={{
                          '--ch-accent': cc.accent,
                          '--ch-bg': cc.bg,
                          scrollMarginTop: '70px',
                        } as React.CSSProperties}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            background: cc.accent, color: '#fff',
                            fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 8px', borderRadius: '9999px', letterSpacing: '0.05em',
                          }}>Chapter {m.chapter}</span>
                          <span style={{ fontSize: '0.7rem', color: cc.text, fontWeight: 600 }}>
                            {chDone}/{chMods.length}モジュール
                          </span>
                        </div>
                        <h3 style={{
                          margin: '0.35rem 0 0', fontSize: '1.05rem', fontWeight: 800,
                          color: cc.text, letterSpacing: '-0.2px',
                        }}>{chapterNames[m.chapter]}</h3>
                        <div className="chapter-header-progress">
                          <div className="chapter-header-progress-fill" style={{ width: `${chPct}%`, background: cc.accent }} />
                        </div>
                      </div>
                    );
                  }
                  const p = progress[m.id];
                  acc.push(
                    <div key={m.id} className="card-module" onClick={() => updateModuleId(m.id)}
                      style={{
                        '--ch-accent': cc.accent,
                        '--ch-light': cc.light,
                        borderRadius: idx === filteredModules.length - 1 || filteredModules[idx + 1]?.chapter !== m.chapter
                          ? '0 0 var(--radius-card) var(--radius-card)' : '0',
                        marginBottom: 0,
                        borderTop: 'none',
                      } as React.CSSProperties}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          background: cc.bg, color: cc.text,
                          fontSize: '0.6875rem', fontWeight: 600,
                          padding: '2px 8px', borderRadius: '9999px',
                        }}>Ch{m.chapter}</span>
                        {p && (
                          <span className={`progress-badge ${p.score === p.total ? 'perfect' : ''}`}>
                            {p.score === p.total ? '✓ ' : ''}{p.score}/{p.total}問
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: '0.4rem 0 0.2rem', fontSize: '0.95rem' }}>{parseContent(m.title)}</h4>
                      <div className="module-desc">{parseContent(m.description)}</div>
                    </div>
                  );
                  return acc;
                }, [])}
              </div>
            </motion.div>
          ) : view === 'glossary' ? (
            <motion.div key="glossary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800 }}>用語集</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>ビジネス実務法務検定3級の頻出用語をまとめました。</p>
              </div>
              <div className="glossary-grid">
                {Object.values(glossary).map(term => {
                  const levelColor = { '基礎': '#22c55e', '中級': '#eab308', '上級': '#ef4444' }[term.level];
                  return (
                    <div key={term.id} className="card-glossary">
                      <div className="glossary-header">
                        <h4>{term.term}</h4>
                        <span className="badge-level" style={{ background: `${levelColor}22`, color: levelColor }}>{term.level}</span>
                      </div>
                      <p className="glossary-explanation">{term.explanation}</p>
                      {term.relatedTerms && term.relatedTerms.length > 0 && (
                        <div className="related-links">
                          <p className="label-related">関連用語</p>
                          <div className="links-row">
                            {term.relatedTerms.map(rtid => (
                              <span key={rtid} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                                {glossary[rtid]?.term || rtid}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : view === 'about' ? (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="privacy-page">
                <h2>サイトについて</h2>

                <section>
                  <h3>このサイトについて</h3>
                  <p>「ビジネス実務法務検定 3級 学習リファレンス」は、ビジネス実務法務検定3級の合格を目指す方のために作られた、個人運営の学習支援サイトです。</p>
                  <p>民法・商法・会社法・労働法・知的財産権など、企業活動に必要な法律知識をわかりやすく解説しています。</p>
                  <p className="privacy-disclaimer">本サイトは東京商工会議所の公式サイトではありません。試験の最新情報・申込方法・合否については、必ず公式サイトをご確認ください。</p>
                </section>

                <section>
                  <h3>コンテンツ構成</h3>
                  <ul>
                    <li><strong>学習モジュール（全{modules.length}モジュール）</strong>：{modules.map(m => m.title).join('・')}</li>
                    <li><strong>用語集</strong>：3級頻出用語の解説</li>
                    <li><strong>全範囲クイズ</strong>：全モジュールからランダム出題</li>
                  </ul>
                </section>

                <section>
                  <h3>編集・制作方針</h3>
                  <p>本サイトのコンテンツは、ビジネス実務法務検定（3級）の公式の出題範囲や、関連する法令・一般に流通している法務書籍を参照しつつ、運営者が内容を一から再構成し、初学者がつまずきやすい点を補う形で独自に解説しています。他サイトの文章をそのまま転載することはありません。</p>
                  <p>用語集・確認問題は、すべて本サイト向けに独自に制作したものです。法改正や内容の誤り・古くなった情報に気づいた場合は、お問い合わせを受けて随時見直し・修正します。</p>
                </section>

                <section>
                  <h3>運営者について</h3>
                  <p>本サイトは、資格学習を個人的に進める中で、同じように学んでいる方の助けになればと思い作成・公開しています。</p>
                  <p>お問い合わせは<a href="https://forms.gle/ccMv7oKwz6ysDHBe6" target="_blank" rel="noopener noreferrer">こちらのGoogleフォーム</a>からお願いします。</p>
                </section>

                <section>
                  <h3>免責事項</h3>
                  <p>本サイトの解説・問題は学習目的で作成されており、内容の正確性・完全性を保証するものではありません。本サイトの情報を利用したことによるいかなる損害についても、運営者は責任を負いかねます。また、本サイトは検定への合格を保証するものではありません。</p>
                </section>
              </div>
            </motion.div>
          ) : view === 'guide' ? (
            <motion.div key="guide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ExamGuide />
            </motion.div>
          ) : view === 'usecase' ? (
            <motion.div key="usecase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div dangerouslySetInnerHTML={{ __html: buildUsecaseHtml(window.location.pathname.startsWith('/bizlaw-g3/') ? '/bizlaw-g3' : '') }} />
            </motion.div>
          ) : view === 'privacy' ? (
            <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="privacy-page">
                <h2>プライバシーポリシー</h2>
                <p className="privacy-updated">最終更新：2026年5月</p>

                <section>
                  <h3>1. サイトについて</h3>
                  <p>本サイト「ビジネス実務法務検定 3級 学習リファレンス」は、ビジネス実務法務検定3級の学習を支援することを目的とした個人運営のサイトです。</p>
                  <p className="privacy-disclaimer">本サイトは東京商工会議所の公式サイトではありません。試験の出題範囲・申込方法・合否については、必ず公式サイトをご確認ください。</p>
                </section>

                <section>
                  <h3>2. 学習進捗データについて</h3>
                  <p>クイズの得点・完了状況は、お使いのブラウザの <strong>ローカルストレージ</strong> にのみ保存されます。このデータは外部サーバーへ送信されることはなく、運営者も閲覧できません。ブラウザのデータ削除により消去されます。</p>
                </section>

                <section>
                  <h3>3. コンテンツの免責事項</h3>
                  <p>本サイトの解説・問題は学習目的で作成されており、内容の正確性を保証するものではありません。本サイトの情報を利用したことによるいかなる損害についても、運営者は責任を負いかねます。</p>
                </section>

                <section>
                  <h3>4. 本ポリシーの変更</h3>
                  <p>本ポリシーは予告なく変更される場合があります。変更後のポリシーはこのページへの掲載をもって効力を生じます。</p>
                </section>
              </div>
            </motion.div>
          ) : view === 'not-found' ? (
            <motion.div key="not-found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</p>
                <h2 style={{ marginBottom: '0.5rem' }}>ページが見つかりません</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>指定されたページは存在しません。</p>
                <button className="btn" style={{ display: 'inline-flex', width: 'auto' }} onClick={() => updateModuleId(null)}>
                  トップに戻る
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="site-footer">
        <p className="footer-disclaimer">
          本サイトは個人による学習支援サイトであり、東京商工会議所の公式サイトではありません。掲載内容は個人の見解に基づくものであり、公式の情報を保証するものではありません。
        </p>
        <div className="footer-links">
          <button className="footer-link" onClick={() => switchView('about')}>サイトについて</button>
          <button className="footer-link" onClick={() => switchView('privacy')}>プライバシーポリシー</button>
          <a className="footer-link" href="https://study-apps.com/editorial-policy/">編集方針</a>
        </div>
        <p className="footer-copy">© 2026 ビジネス実務法務検定 3級 学習リファレンス</p>
      </footer>
    </div>
  );
}

export default App;
