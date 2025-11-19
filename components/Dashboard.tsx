import React from 'react';
import { AppView, LanguageLevel } from '../types';
import { MessageSquare, Image, Video, Globe, CheckCircle, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
}

const levels: LanguageLevel[] = [
  { id: '1', level: 'A1', title: 'Beginner', description: 'Basic phrases and everyday interactions', color: 'bg-green-500' },
  { id: '2', level: 'A2', title: 'Elementary', description: 'Simple communication on familiar topics', color: 'bg-emerald-500' },
  { id: '3', level: 'B1', title: 'Intermediate', description: 'Work, school, and leisure conversation', color: 'bg-teal-500' },
  { id: '4', level: 'B2', title: 'Upper Interm.', description: 'Fluent and spontaneous interaction', color: 'bg-cyan-500' },
];

const features = [
  { view: AppView.LIVE_TUTOR, title: 'Conversation Practice', icon: MessageSquare, desc: 'Speak with Sasha (AI Tutor) in real-time.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { view: AppView.SCENE_BUILDER, title: 'Visual Context', icon: Image, desc: 'Edit images to create custom vocabulary cards.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { view: AppView.IMMERSION_VIDEO, title: 'Immersion Video', icon: Video, desc: 'Animate scenes with Veo for listening practice.', color: 'text-pink-600', bg: 'bg-pink-50' },
  { view: AppView.CULTURAL_INSIGHTS, title: 'Cultural Search', icon: Globe, desc: 'Find real-world usage and cultural facts.', color: 'text-blue-600', bg: 'bg-blue-50' },
];

const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Master a new language with Gemini</h1>
            <p className="text-indigo-100 text-lg mb-8">Experience the future of learning. Converse with AI, visualize concepts, and explore culture in real-time.</p>
            <button 
                onClick={() => onChangeView(AppView.LIVE_TUTOR)}
                className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold shadow hover:bg-indigo-50 transition-colors"
            >
                Start Speaking Now
            </button>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Learning Path */}
      <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Learning Path</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {levels.map((lvl) => (
                  <div key={lvl.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                          <span className={`${lvl.color} text-white text-xs font-bold px-2 py-1 rounded-md`}>{lvl.level}</span>
                          <CheckCircle className="w-5 h-5 text-slate-200 group-hover:text-green-500 transition-colors" />
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">{lvl.title}</h3>
                      <p className="text-sm text-slate-500">{lvl.description}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* Features Grid */}
      <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">AI Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feat) => (
                  <div 
                    key={feat.view} 
                    onClick={() => onChangeView(feat.view)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                      <div className="flex items-center mb-4">
                          <div className={`p-3 rounded-lg ${feat.bg} ${feat.color} mr-4 group-hover:scale-110 transition-transform`}>
                              <feat.icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">{feat.title}</h3>
                      </div>
                      <p className="text-slate-500 mb-4">{feat.desc}</p>
                      <div className="flex items-center text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Try it <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;