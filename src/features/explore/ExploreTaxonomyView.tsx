import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DBService } from '../../services/dbService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Award,
  Building2,
  Briefcase,
  Layers,
  BookOpen,
  Search,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface Props {
  initialSection?: 'concursos' | 'orgaos' | 'cargos' | 'bancas' | 'disciplinas';
}

export const ExploreTaxonomyView: React.FC<Props> = ({ initialSection = 'concursos' }) => {
  const { setActiveTab, setInitialQuestionFilter } = useApp();
  const [activeSection, setActiveSection] = useState<'concursos' | 'orgaos' | 'cargos' | 'bancas' | 'disciplinas'>(
    initialSection
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Data sources
  const contests = DBService.getContests();
  const organizations = DBService.getOrganizations();
  const positions = DBService.getPositions();
  const boards = DBService.getBoards();
  const disciplines = DBService.getTaxonomyDisciplines();

  const handleFilterQuestions = (filter: any) => {
    setInitialQuestionFilter(filter);
    setActiveTab('questions');
  };

  const filteredContests = contests.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.acronym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPositions = positions.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.careerArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBoards = boards.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.acronym.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDisciplines = disciplines.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Guia Completo de Concursos Brasil
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Explore a Base Mestre de Concursos Públicos
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Consulte órgãos federais, estaduais e municipais, editais abertos e previstos, bancas examinadoras e matrizes curriculares organizadas por tópicos.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'concursos', label: 'Concursos & Editais', icon: Award, count: contests.length },
          { id: 'orgaos', label: 'Órgãos & Empresas', icon: Building2, count: organizations.length },
          { id: 'cargos', label: 'Cargos & Carreiras', icon: Briefcase, count: positions.length },
          { id: 'bancas', label: 'Bancas Examinadoras', icon: Layers, count: boards.length },
          { id: 'disciplinas', label: 'Disciplinas & Assuntos', icon: BookOpen, count: disciplines.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSection(tab.id as any);
                setSearchQuery('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Buscar nesta categoria (${activeSection})...`}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Section: Concursos */}
      {activeSection === 'concursos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredContests.map((c) => (
            <Card key={c.id} className="p-6 flex flex-col justify-between space-y-4 hover:border-indigo-400 transition">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {c.sphere} • {c.year}
                  </span>
                  <Badge
                    variant={
                      c.status === 'Inscrições Abertas'
                        ? 'success'
                        : c.status === 'Edital Publicado'
                        ? 'primary'
                        : c.status === 'Previsto'
                        ? 'warning'
                        : 'default'
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Banca: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.board}</span> • 
                  Vagas: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.vacancies || 'A definir'}</span>
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">{c.organizationName}</span>
                <Button
                  onClick={() => handleFilterQuestions({ contest: c.organizationName })}
                  className="text-xs flex items-center gap-1.5"
                >
                  Resolver Questões
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Section: Órgãos e Empresas */}
      {activeSection === 'orgaos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrgs.map((o) => (
            <Card key={o.id} className="p-6 flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                    {o.acronym}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {o.sphere}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{o.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                  {o.description}
                </p>
                <div className="text-[11px] text-slate-400">
                  Tipo: <span className="text-slate-600 dark:text-slate-300 font-medium">{o.type}</span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => handleFilterQuestions({ contest: o.acronym })}
                  className="w-full text-xs justify-center flex items-center gap-1.5"
                >
                  Ver Questões deste Órgão
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Section: Cargos */}
      {activeSection === 'cargos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPositions.map((p) => (
            <Card key={p.id} className="p-6 flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {p.careerArea}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>Escolaridade: <span className="font-semibold text-slate-700 dark:text-slate-300">{p.schoolingLevel}</span></div>
                  <div>Remuneração estimada: <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.salaryEstimated}</span></div>
                  <div className="text-[11px] text-slate-400">{p.organizationName}</div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => handleFilterQuestions({})}
                  className="w-full text-xs justify-center flex items-center gap-1.5"
                >
                  Questões para este Cargo
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Section: Bancas */}
      {activeSection === 'bancas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBoards.map((b) => (
            <Card key={b.id} className="p-6 flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{b.acronym}</h3>
                  <span className="text-xs text-slate-400">Banca Examinadora</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{b.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {b.styleDescription}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  onClick={() => handleFilterQuestions({ board: b.acronym })}
                  className="text-xs flex items-center gap-1.5"
                >
                  Treinar Questões da {b.acronym}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Section: Disciplinas */}
      {activeSection === 'disciplinas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDisciplines.map((d) => (
            <Card key={d.id} className="p-6 flex flex-col justify-between hover:border-indigo-400 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {d.code || 'DISC'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {d.questionCount || 200}+ questões
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{d.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Conteúdo programático estruturado em tópicos teóricos, exercícios comentados e gabarito detalhado.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={() => handleFilterQuestions({ discipline: d.name })}
                  className="w-full text-xs justify-center flex items-center gap-1.5"
                >
                  Praticar {d.name}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
