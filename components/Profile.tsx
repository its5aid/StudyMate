

import React, { useState } from 'react';
import { User, FileText, Calendar, BarChart2, Edit, Save, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4 rtl:space-x-reverse animate-fade-in-up">
    <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const { user, userActivity, language, setLanguage, t, updateUser } = useApp();
  const [isEditingMajor, setIsEditingMajor] = useState(false);
  const [majorInput, setMajorInput] = useState(user?.major || '');

  if (!user) {
    return <div>{t('profile.loading')}</div>;
  }

  const handleSaveMajor = () => {
    updateUser({ major: majorInput });
    setIsEditingMajor(false);
  };
  
  const handleCancelEdit = () => {
    setMajorInput(user.major || '');
    setIsEditingMajor(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8 animate-fade-in-up">
        <div className="flex flex-col md:flex-row items-center text-center md:text-right">
          <div className="relative mb-4 md:mb-0 md:mr-8 rtl:md:mr-0 rtl:md:ml-8 flex-shrink-0">
            <img
              className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-200"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&font-size=0.4`}
              alt="User"
            />
             <div className="absolute bottom-0 right-0 bg-green-500 rounded-full w-5 h-5 border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
             {isEditingMajor ? (
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="text" 
                  value={majorInput} 
                  onChange={(e) => setMajorInput(e.target.value)} 
                  className="w-full px-3 py-1 rounded-md bg-slate-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder={t('login.major.placeholder')}
                />
                <button onClick={handleSaveMajor} className="p-1.5 text-green-600 hover:bg-green-100 rounded-full"><Save size={16}/></button>
                <button onClick={handleCancelEdit} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"><X size={16}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                <p className="text-sm text-slate-500">{user.major || t('profile.noMajor')}</p>
                <button onClick={() => setIsEditingMajor(true)} className="text-slate-400 hover:text-indigo-600">
                  <Edit size={14}/>
                </button>
              </div>
            )}
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
    </div>
  );
};

export default Profile;
