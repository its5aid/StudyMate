import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserFile, UserPlan, Page, Feature } from '../types';

interface UserActivity {
  files: UserFile[];
  plans: UserPlan[];
  tests: number;
}

interface AppContextType {
  user: User;
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
  // FIX: Add missing authentication functions to the context type.
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string, major?: string) => Promise<{ success: boolean; message: string }>;
  checkEmailExists: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
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
            } else {
                const defaultUser: User = {
                    name: 'طالب',
                    email: 'student@studymate.app',
                    major: 'غير محدد',
                };
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(defaultUser));
                setUser(defaultUser);
            }

            const storedActivity = localStorage.getItem(ACTIVITY_STORAGE_KEY);
            if (storedActivity) {
                setUserActivity(JSON.parse(storedActivity));
            }
        } catch (error) {
            console.error("Failed to load translations or user data", error);
            setTranslations({ ar: {}, en: {} }); // Fallback to avoid crash
            const defaultUser: User = {
                name: 'طالب',
                email: 'student@studymate.app',
                major: 'غير محدد',
            };
            setUser(defaultUser);
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

  // FIX: Implement mock authentication functions.
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; }> => {
    const storedUser = localStorage.getItem(USER_DATA_KEY);
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email === email) {
            // In a real app, you'd check a hashed password. This is a mock.
            setUser(parsedUser);
            return { success: true, message: t('login.success.login') };
        }
    }
    return { success: false, message: t('login.error.credentials') };
  };

  const signup = async (name: string, email: string, password: string, major: string = ''): Promise<{ success: boolean; message: string; }> => {
    const storedUser = localStorage.getItem(USER_DATA_KEY);
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.email === email) {
            return { success: false, message: t('login.error.emailExists') };
        }
    }
    const newUser: User = { name, email, major };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { success: true, message: t('login.success.signup') };
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      if (storedUser) {
          return JSON.parse(storedUser).email === email;
      }
      return false;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string; }> => {
      const storedUser = localStorage.getItem(USER_DATA_KEY);
      if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.email === email) {
              // In a real app, you'd update the user's password. This is a mock.
              return { success: true, message: t('login.success.passwordReset') };
          }
      }
      return { success: false, message: t('login.error.emailNotFound') };
  };

  if (isAppLoading || !user) {
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
    // FIX: Add mock functions to the context value.
    login,
    signup,
    checkEmailExists,
    resetPassword,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
