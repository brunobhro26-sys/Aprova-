import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { GlobalSearchResult } from '../../types';
import {
  Search,
  X,
  BookOpen,
  Award,
  Briefcase,
  Building2,
  FileQuestion,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, closeSearchModal, setActiveTab, setInitialQuestionFilter } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isSearchModalOpen) {
          closeSearchModal();
        } else {
          // Open search modal handled via context if available
        }
      }
      if (e.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const mapped: GlobalSearchResult[] = data.results.map((r: any) => {
              let category: any = 'Disciplinas';
              if (r.type === 'exam') category = 'Concursos';
              else if (r.type === 'organization') category = 'Órgãos';
              else if (r.type === 'position') category = 'Cargos';
              else if (r.type === 'board') category = 'Bancas';
              else if (r.type === 'question') category = 'Questões';

              return {
                id: r.id,
                title: r.title,
                subtitle: r.subtitle,
                category,
                filterValue: r.title,
              };
            });
            setResults(mapped);
            return;
          }
        }
      } catch (e) {
        // Fallback to local index
      }

      const found = DBService.globalSearch(query);
      setResults(found);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchModalOpen) return null;

  const handleSelectResult = (item: GlobalSearchResult) => {
    closeSearchModal();
    if (item.category === 'Questões') {
      setActiveTab('questions');
    } else if (item.category === 'Disciplinas') {
      setInitialQuestionFilter({ discipline: item.filterValue });
      setActiveTab('questions');
    } else if (item.category === 'Concursos') {
      setInitialQuestionFilter({ contest: item.filterValue });
      setActiveTab('questions');
    } else if (item.category === 'Bancas') {
      setInitialQuestionFilter({ board: item.filterValue });
      setActiveTab('questions');
    } else if (item.category === 'Assuntos') {
      setInitialQuestionFilter({ subject: item.filterValue });
      setActiveTab('questions');
    } else {
      setActiveTab('questions');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Concursos':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'Cargos':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'Bancas':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'Disciplinas':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'Assuntos':
        return <Layers className="w-4 h-4 text-cyan-500" />;
      case 'Questões':
        return <FileQuestion className="w-4 h-4 text-indigo-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquise por concurso, cargo, banca, disciplina, assunto ou código de questão..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Quick suggestions when query is empty */}
        {query.trim().length < 2 && (
          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Buscas Populares no APROVA+
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Transpetro',
                'Técnico em Eletrotécnica',
                'Cesgranrio',
                'Circuitos Elétricos',
                'Lei de Ohm',
                'Crase',
                'Petrobras',
                'Concordância Verbal'
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition"
                >
                  {term}
                </button>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span>Navegue usando o teclado ou mouse</span>
              <span>Pressione ESC para fechar</span>
            </div>
          </div>
        )}

        {/* Results List */}
        {query.trim().length >= 2 && (
          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
            {results.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Nenhum resultado encontrado para "{query}"
                </p>
                <p className="text-xs mt-1">
                  Tente buscar por termos mais genéricos como "Transpetro", "Eletrotécnica" ou "Português".
                </p>
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelectResult(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 transition text-left group"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
