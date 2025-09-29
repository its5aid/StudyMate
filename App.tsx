

import React from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { Page, Feature } from './types';
import { BrainCircuit, BookOpen, ClipboardList, CalendarClock, Search, User } from 'lucide-react';
import { useApp } from './context/AppContext';

const App: React.FC = () => {
  const { isAuthenticated, logout, t } = useApp();
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
  const [activeFeature, setActiveFeature] = React.useState<Feature>('ai-assistant');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);


  if (!isAuthenticated) {
    return <Login />;
  }
  
  const navItems: { id: Feature; name: string; icon: React.ReactNode; page: Page }[] = [
    { id: 'ai-assistant', name: t('sidebar.academicAssistant'), icon: <BrainCircuit size={22} />, page: 'dashboard' },
    { id: 'summarizer', name: t('sidebar.summarizer'), icon: <BookOpen size={22} />, page: 'dashboard' },
    { id: 'test-generator', name: t('sidebar.testGenerator'), icon: <ClipboardList size={22} />, page: 'dashboard' },
    { id: 'study-planner', name: t('sidebar.studyPlanner'), icon: <CalendarClock size={22} />, page: 'dashboard' },
    { id: 'research-assistant', name: t('sidebar.researchAssistant'), icon: <Search size={22} />, page: 'dashboard' },
  ];

  const profileItem: { id: 'profile'; name: string; icon: React.ReactNode; page: Page } = { id: 'profile', name: t('sidebar.profile'), icon: <User size={22} />, page: 'profile' };

  const handleSetPage = (page: Page, feature?: Feature) => {
    setCurrentPage(page);
    if(feature) {
      setActiveFeature(feature);
    }
    setIsSidebarOpen(false); // Close sidebar on navigation
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      <Sidebar 
        navItems={navItems}
        profileItem={profileItem}
        activeItem={currentPage === 'dashboard' ? activeFeature : 'profile'}
        setActiveItem={handleSetPage}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        logout={logout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-4 sm:p-6 md:p-8">
          {currentPage === 'dashboard' && <Dashboard activeFeature={activeFeature} />}
          {currentPage === 'profile' && <Profile />}
        </main>
      </div>
    </div>
  );
};

export default App;
