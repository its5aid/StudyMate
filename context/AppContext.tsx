import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserFile, UserPlan, Page, Feature } from '../types';

interface UserActivity {
  files: UserFile[];
  plans: UserPlan[];
  tests: number;
}

interface AuthResponse {
    success: boolean;
    message: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, pass: string, major: string) => Promise<AuthResponse>;
  logout: () => void;
  checkEmailExists: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPass: string) => Promise<AuthResponse>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'studyMateUsers';
const SESSION_STORAGE_KEY = 'studyMateSession';

const AppLoading: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-500">جاري تحميل التطبيق...</p>
        </div>
    </div>
);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity>({
    files: [],
    plans: [],
    tests: 0,
  });
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');
  const [translations, setTranslations] = useState<any>(null);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeFeature, setActiveFeature] = useState<Feature>('home-dashboard');
  
  const navigateTo = (page: Page, feature?: Feature) => {
    setCurrentPage(page);
    if (feature) {
      setActiveFeature(feature);
    }
  };

  useEffect(() => {
    const fetchTranslations = async () => {
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
        } catch (error) {
            console.error("Failed to load translations", error);
            setTranslations({ ar: {}, en: {} }); // Fallback to avoid crash
        } finally {
            setIsLoadingTranslations(false);
        }
    };
    fetchTranslations();
  }, []);
  
  const t = (key: string, replacements: Record<string, string | number> = {}): string => {
    if (!translations) return key;
    let translation = translations[language][key] || key;
    Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
    });
    return translation;
  };

  useEffect(() => {
    // In a real app, this would be replaced with a call to Firebase Auth listener
    try {
        const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedSession) {
            const sessionUser = JSON.parse(storedSession);
            setUser(sessionUser);
            setIsAuthenticated(true);
        }
    } catch (e) {
        console.error("Failed to parse session data from localStorage", e);
        localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);
  
  useEffect(() => {
    if (user) {
        // In a real app, this data would be fetched from Firestore
        const activityKey = `studyMateActivity_${user.email}`;
        const storedActivity = localStorage.getItem(activityKey);
        if (storedActivity) {
            setUserActivity(JSON.parse(storedActivity));
        }
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
  };

  // IMPORTANT: All functions below (login, signup, etc.) need to be rewritten
  // to use the Firebase SDK instead of localStorage. This is the next step after
  // wiring up the backend.

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    const storedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
    const foundUser = storedUsers.find((u: any) => u.email === email && u.password === pass);

    if (foundUser) {
      const currentUser: User = { name: foundUser.name, email: foundUser.email, major: foundUser.major };
      setUser(currentUser);
      setIsAuthenticated(true);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: t('login.error.invalidCredentials') };
  };

  const signup = async (name: string, email: string, pass: string, major: string): Promise<AuthResponse> => {
     const storedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
     const userExists = storedUsers.some((u: any) => u.email === email);

     if (userExists) {
         return { success: false, message: t('login.error.emailExists') };
     }

     const newUser = { name, email, password: pass, major };
     storedUsers.push(newUser);
     localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUsers));
     
     return login(email, pass);
  };
  
  const logout = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setUserActivity({ files: [], plans: [], tests: 0 });
  }

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
    return storedUsers.some((u: any) => u.email === email);
  };

  const resetPassword = async (email: string, newPass: string): Promise<AuthResponse> => {
    const storedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
    const userIndex = storedUsers.findIndex((u: any) => u.email === email);

    if (userIndex === -1) {
        return { success: false, message: t('login.error.emailNotFound') };
    }

    storedUsers[userIndex].password = newPass;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUsers));

    return { success: true, message: t('login.success.passwordReset') };
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));

    const storedUsers = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '[]');
    const userIndex = storedUsers.findIndex((u: any) => u.email === user.email);
    if(userIndex > -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedData };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUsers));
    }
  };
  
  const saveActivity = (activity: UserActivity) => {
      if(user) {
          localStorage.setItem(`studyMateActivity_${user.email}`, JSON.stringify(activity));
          setUserActivity(activity);
      }
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

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout,
    checkEmailExists,
    resetPassword,
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
  };
  
  if (isLoadingTranslations) {
    return <AppLoading />;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};