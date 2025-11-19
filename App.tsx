import React, { useState } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import LiveTutor from './components/LiveTutor';
import SceneBuilder from './components/SceneBuilder';
import ImmersionVideo from './components/ImmersionVideo';
import CulturalInsights from './components/CulturalInsights';
import { Layout, MessageSquare, Image, Video, Globe, Home } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onChangeView={setCurrentView} />;
      case AppView.LIVE_TUTOR:
        return <LiveTutor />;
      case AppView.SCENE_BUILDER:
        return <SceneBuilder />;
      case AppView.IMMERSION_VIDEO:
        return <ImmersionVideo />;
      case AppView.CULTURAL_INSIGHTS:
        return <CulturalInsights />;
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg' 
          : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-4 z-10">
        <div className="flex items-center space-x-2 px-4 mb-10 mt-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">LinguaFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view={AppView.DASHBOARD} icon={Home} label="Dashboard" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Practice</div>
          <NavItem view={AppView.LIVE_TUTOR} icon={MessageSquare} label="Conversation" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Create</div>
          <NavItem view={AppView.SCENE_BUILDER} icon={Image} label="Scene Builder" />
          <NavItem view={AppView.IMMERSION_VIDEO} icon={Video} label="Immersion Video" />
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Explore</div>
          <NavItem view={AppView.CULTURAL_INSIGHTS} icon={Globe} label="Cultural Search" />
        </nav>

        <div className="p-4 bg-slate-50 rounded-xl mt-auto border border-slate-100">
          <p className="text-xs text-slate-500 text-center">Powered by Gemini 2.5</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20 shadow-sm">
           <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-md">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800">LinguaFlow</span>
           </div>
           <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="p-2 rounded-full hover:bg-slate-100">
             <Home className="w-6 h-6 text-slate-600" />
           </button>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;