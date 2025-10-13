import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
// FIX: Import the missing UserActivity type.
import { User, UserFile, UserPlan, Page, Feature, UserActivity } from '../types';
import Login from '../components/Login';

interface AppContextType {
  user: User | null;
  updateUser: (updatedData: Partial<User>) => void;
  userActivity: UserActivity;
  addFile: (file: UserFile) => void;
  addPlan: (plan: UserPlan) => void;
  addTest: () => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  currentPage: Page;
  activeFeature: Feature;
  navigateTo: (page: Page, feature?: Feature) => void;
  handleLogin: (name: string, major: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_DATA_KEY = 'studyMateUser';
const ACTIVITY_STORAGE_KEY = 'studyMateActivity';

const AppLoading: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">جاري تحميل التطبيق...</p>
        </div>
    </div>
);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity>({
    files: [],
    plans: [],
    tests: 0,
  });
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');
  const [translations, setTranslations] = useState<any>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeFeature, setActiveFeature] = useState<Feature>('home-dashboard');
  
  const navigateTo = (page: Page, feature?: Feature) => {
    setCurrentPage(page);
    if (feature) {
      setActiveFeature(feature);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
        try {
            const [arRes, enRes] = await Promise.all([
                fetch('/locales/ar.json'),
                fetch('/locales/en.json')
            ]);
            if (!arRes.ok || !enRes.ok) {
              throw new Error('Network response was not ok');
            }
            const ar = await arRes.json();
            const en = await enRes.json();
            setTranslations({ ar, en });

            const storedUser = localStorage.getItem(USER_DATA_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                const storedActivity = localStorage.getItem(ACTIVITY_STORAGE_KEY);
                if (storedActivity) {
                    setUserActivity(JSON.parse(storedActivity));
                }
            }
        } catch (error) {
            console.error("Failed to load translations or user data", error);
            setTranslations({ ar: {}, en: {} }); // Fallback to avoid crash
        } finally {
            setIsAppLoading(false);
        }
    };
    initializeApp();
  }, []);
  
  const t = (key: string, replacements: Record<string, string | number> = {}): string => {
    if (!translations) return key;
    let translation = (translations[language] && translations[language][key]) || key;
    Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
    });
    return translation;
  };
  
  const handleLogin = (name: string, major: string) => {
    const newUser: User = {
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@studymate.app`, // Dummy email
      major: major || t('profile.noMajor')
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser));
    // Reset activity for the new user
    localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    setUser(newUser);
    setUserActivity({ files: [], plans: [], tests: 0 });
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
  };
  
  const saveActivity = (activity: UserActivity) => {
      localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
      setUserActivity(activity);
  }

  const addFile = (file: UserFile) => {
    const newActivity = { ...userActivity, files: [...userActivity.files, file] };
    saveActivity(newActivity);
  };

  const addPlan = (plan: UserPlan) => {
    const newActivity = { ...userActivity, plans: [...userActivity.plans, plan] };
    saveActivity(newActivity);
  };

  const addTest = () => {
    const newActivity = { ...userActivity, tests: userActivity.tests + 1 };
    saveActivity(newActivity);
  };

  if (isAppLoading) {
    return <AppLoading />;
  }

  const value: AppContextType = {
    user,
    updateUser,
    userActivity,
    addFile,
    addPlan,
    addTest,
    language,
    setLanguage,
    t,
    currentPage,
    activeFeature,
    navigateTo,
    handleLogin,
  };
  
  return (
    <AppContext.Provider value={value}>
        {user ? children : <Login />}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
