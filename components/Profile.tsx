import React, { useState, useEffect, useRef } from 'react';
import { User, FileText, Calendar, BarChart2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from './common/StatCard';

// Helper hook for intervals, as requested for auto-saving.
function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const Profile: React.FC = () => {
  const { user, userActivity, language, setLanguage, t, updateUser } = useApp();
  const [profileData, setProfileData] = useState({ name: '', major: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Load user data into local state when component mounts or user context changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        major: user.major || ''
      });
    }
  }, [user]);
  
  // Auto-save logic
  useInterval(() => {
    if (user && (profileData.name !== user.name || profileData.major !== (user.major || ''))) {
      if (profileData.name.trim() !== '') {
        setIsSaving(true);
        updateUser({ name: profileData.name, major: profileData.major });
        setTimeout(() => setIsSaving(false), 1500); // Visual feedback for saving
      }
    }
  }, 5000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
  };


  if (!user) {
    return <div>{t('profile.loading')}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center text-center md:text-right">
          <div className="relative mb-4 md:mb-0 md:mr-8 rtl:md:mr-0 rtl:ml-8 flex-shrink-0">
            <img
              className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-200"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || user.name)}&background=6366f1&color=fff&font-size=0.4`}
              alt="User"
            />
             <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-5 h-5 border-2 border-white"></div>
          </div>
          <div className="w-full">
            <div className="mb-4">
                 <label htmlFor="name" className="block text-sm font-medium text-slate-500 mb-1">{t('login.name')}</label>
                 <input 
                    id="name"
                    name="name"
                    type="text" 
                    value={profileData.name} 
                    onChange={handleInputChange} 
                    className="w-full text-2xl font-bold text-center md:text-right text-slate-800 bg-slate-50 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={t('login.name.placeholder')}
                />
            </div>
             <div className="mb-2">
                 <label htmlFor="major" className="block text-sm font-medium text-slate-500 mb-1">{t('login.major')}</label>
                 <input 
                    id="major"
                    name="major"
                    type="text" 
                    value={profileData.major} 
                    onChange={handleInputChange} 
                    className="w-full text-center md:text-right text-slate-600 bg-slate-50 rounded-md p-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={t('login.major.placeholder')}
                />
            </div>
             <div className="h-5 mt-2 text-sm text-slate-400 flex items-center gap-2 justify-center md:justify-start">
                <Info size={14} />
                <span>{isSaving ? t('profile.saving') : t('profile.autoSaveMessage', {seconds: 5})}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in-up" style={{animationDelay: '50ms'}}>
        <h4 className="text-lg font-semibold text-slate-800 mb-4">{t('profile.languageSettings')}</h4>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${language === 'ar' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            {t('profile.language.ar')}
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-md font-semibold transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            {t('profile.language.en')}
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-700 mb-4">{t('profile.activitySummary')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<FileText />} label={t('profile.uploadedFiles')} value={userActivity.files.length} />
        <StatCard icon={<Calendar />} label={t('profile.studyPlans')} value={userActivity.plans.length} />
        <StatCard icon={<BarChart2 />} label={t('profile.testsGenerated')} value={userActivity.tests} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in-up" style={{animationDelay: '100ms'}}>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">{t('profile.recentFiles')}</h4>
          <ul className="space-y-3">
            {userActivity.files.length > 0 ? userActivity.files.slice(-3).reverse().map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3 rounded-md bg-slate-50">
                <span className="text-slate-700 truncate">{file.name}</span>
                <span className="text-sm text-slate-400 flex-shrink-0">{file.size}</span>
              </li>
            )) : <p className="text-center text-slate-400 p-4">{t('profile.noFiles')}</p>}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in-up" style={{animationDelay: '200ms'}}>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">{t('profile.recentPlans')}</h4>
           <ul className="space-y-3">
            {userActivity.plans.length > 0 ? userActivity.plans.slice(-2).reverse().map((plan, index) => (
                <li key={index} className="flex items-center p-3 rounded-md border border-slate-200">
                    <Calendar className="text-indigo-500 w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0"/>
                    <div>
                        <span className="text-slate-700">{plan.title}</span>
                        <p className="text-xs text-slate-400">{plan.date}</p>
                    </div>
                </li>
            )) : <p className="text-center text-slate-400 p-4">{t('profile.noPlans')}</p>}
          </ul>
        </div>
      </div>
      
      <div className="text-center mt-8 text-sm text-slate-400 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <a 
          href="https://www.instagram.com/its5aid/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-indigo-600 transition-colors"
        >
          {t('profile.copyright')}
        </a>
      </div>

    </div>
  );
};

export default Profile;