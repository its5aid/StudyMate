
import React from 'react';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Page, Feature } from './types';
import { Home, BrainCircuit, BookOpen, ClipboardList, CalendarClock, Search, User } from 'lucide-react';
import { useApp } from './context/AppContext';

const App: React.FC = () => {
  const { t, currentPage, activeFeature, navigateTo } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems: { id: Feature; name: string; icon: React.ReactNode; page: Page }[] = [
    { id: 'home-dashboard', name: t('sidebar.dashboard'), icon: <Home size={22} />, page: 'dashboard' },
    { id: 'ai-assistant', name: t('sidebar.academicAssistant'), icon: <BrainCircuit size={22} />, page: 'dashboard' },
    { id: 'summarizer', name: t('sidebar.summarizer'), icon: <BookOpen size={22} />, page: 'dashboard' },
    { id: 'test-generator', name: t('sidebar.testGenerator'), icon: <ClipboardList size={22} />, page: 'dashboard' },
    { id: 'study-planner', name: t('sidebar.studyPlanner'), icon: <CalendarClock size={22} />, page: 'dashboard' },
    { id: 'research-assistant', name: t('sidebar.researchAssistant'), icon: <Search size={22} />, page: 'dashboard' },
  ];

  const profileItem: { id: 'profile'; name: string; icon: React.ReactNode; page: Page } = { id: 'profile', name: t('sidebar.profile'), icon: <User size={22} />, page: 'profile' };

  const handleSetPage = (page: Page, feature?: Feature) => {
    navigateTo(page, feature);
    setIsSidebarOpen(false); // Close sidebar on navigation
  }
  
  const getTitle = () => {
    if (currentPage === 'profile') {
      return profileItem.name;
    }
    const featureTitles: Record<Feature, string> = {
      'home-dashboard': t('feature.dashboard.title'),
      'ai-assistant': t('feature.aiAssistant.title'),
      'summarizer': t('feature.summarizer.title'),
      'test-generator': t('feature.testGenerator.title'),
      'study-planner': t('feature.studyPlanner.title'),
      'research-assistant': t('feature.researchAssistant.title'),
    };
    return featureTitles[activeFeature] ?? t('appName');
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      <Sidebar 
        navItems={navItems}
        profileItem={profileItem}
        activeItem={currentPage === 'dashboard' ? activeFeature : 'profile'}
        setActiveItem={handleSetPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} title={getTitle()} />
        <main className="flex-1 bg-slate-100 p-4 sm:p-6 md:p-8 flex flex-col overflow-y-auto">
          {currentPage === 'dashboard' && <Dashboard activeFeature={activeFeature} />}
          {currentPage === 'profile' && <Profile />}
        </main>
      </div>
    </div>
  );
};

export default App;
