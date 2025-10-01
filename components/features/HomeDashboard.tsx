
import React from 'react';
import { useApp } from '../../context/AppContext';
import StatCard from '../common/StatCard';
import { FileText, Calendar, BarChart2, BookOpen, ClipboardList, CalendarClock, Search, FileClock } from 'lucide-react';
import { StudyDay } from '../../types';

// Quick Action Card Component
const ActionCard: React.FC<{ icon: React.ReactNode; title: string; onClick: () => void; delay: number }> = ({ icon, title, onClick, delay }) => (
    <button onClick={onClick} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
        <div className="bg-indigo-100 text-indigo-600 rounded-full p-4 mb-4">
            {icon}
        </div>
        <h3 className="font-semibold text-slate-700">{title}</h3>
    </button>
);


const HomeDashboard: React.FC = () => {
    const { user, userActivity, t, navigateTo, language } = useApp();

    const getTodaysTasks = (): StudyDay | null => {
        if (userActivity.plans.length === 0) return null;

        const latestPlan = userActivity.plans[userActivity.plans.length - 1].data;
        if (!latestPlan || !latestPlan.plan) return null;

        const today = new Date();
        const dayNameFormatter = new Intl.DateTimeFormat(language, { weekday: 'long' });
        const todayName = dayNameFormatter.format(today);
        
        const todaysPlan = latestPlan.plan.find(day => day.day.toLowerCase() === todayName.toLowerCase());

        return todaysPlan || null;
    };
    
    const todaysTasks = getTodaysTasks();

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="animate-fade-in-up">
                <h1 className="text-3xl font-bold text-slate-800">{t('dashboard.welcome', {name: user?.name || ''})}</h1>
                <p className="text-slate-500 mt-1">{t('feature.dashboard.description')}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<FileText />} label={t('profile.uploadedFiles')} value={userActivity.files.length} />
                <StatCard icon={<Calendar />} label={t('profile.studyPlans')} value={userActivity.plans.length} />
                <StatCard icon={<BarChart2 />} label={t('profile.testsGenerated')} value={userActivity.tests} />
            </div>

            {/* Main Grid: Today's Plan & Recent Files */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Plan */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('dashboard.todaysPlan')}</h2>
                    {todaysTasks && todaysTasks.tasks.length > 0 ? (
                        <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {todaysTasks.tasks.map((task, index) => (
                                <li key={index} className="flex items-center p-3 rounded-md bg-slate-50 border border-slate-200">
                                    <div className="bg-indigo-100 text-indigo-600 rounded-lg p-2 mr-4 rtl:mr-0 rtl:ml-4">
                                        <CalendarClock size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-700">{task.task} ({task.subject})</p>
                                        <p className="text-sm text-slate-500">{task.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 flex flex-col justify-center items-center h-full">
                            <Calendar size={40} className="mx-auto text-slate-300 mb-4"/>
                            <p className="text-slate-500">{t('dashboard.noTasks')}</p>
                            <p className="text-sm text-slate-400 mt-2">
                                {t('dashboard.createPlanPrompt')}{' '}
                                <button onClick={() => navigateTo('dashboard', 'study-planner')} className="font-semibold text-indigo-600 hover:underline">
                                    {t('dashboard.createPlanLink')}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Recent Files */}
                <div className="bg-white rounded-xl shadow-md p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                     <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('dashboard.recentFiles')}</h2>
                     <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {userActivity.files.length > 0 ? (
                            userActivity.files.slice(-4).reverse().map((file, index) => (
                               <li key={index} className="flex items-center justify-between p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="flex items-center min-w-0">
                                        <div className="text-indigo-500 mr-3 rtl:mr-0 rtl:ml-3 flex-shrink-0">
                                            {file.type === 'summary' ? <BookOpen size={20}/> : <ClipboardList size={20}/>}
                                        </div>
                                        <span className="text-slate-700 truncate text-sm">{file.name}</span>
                                    </div>
                                   <span className="text-xs text-slate-400 flex-shrink-0 ml-2">{file.size}</span>
                               </li> 
                            ))
                        ) : (
                            <div className="text-center py-8 flex flex-col justify-center items-center h-full">
                                <FileClock size={40} className="mx-auto text-slate-300 mb-4"/>
                                <p className="text-slate-500">{t('dashboard.noFiles')}</p>
                            </div>
                        )}
                     </ul>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                 <h2 className="text-xl font-semibold text-slate-800 mb-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>{t('dashboard.quickActions')}</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ActionCard icon={<BookOpen size={28}/>} title={t('dashboard.action.summarize')} onClick={() => navigateTo('dashboard', 'summarizer')} delay={400} />
                    <ActionCard icon={<ClipboardList size={28}/>} title={t('dashboard.action.generateTest')} onClick={() => navigateTo('dashboard', 'test-generator')} delay={500} />
                    <ActionCard icon={<CalendarClock size={28}/>} title={t('dashboard.action.planStudies')} onClick={() => navigateTo('dashboard', 'study-planner')} delay={600} />
                    <ActionCard icon={<Search size={28}/>} title={t('dashboard.action.startResearch')} onClick={() => navigateTo('dashboard', 'research-assistant')} delay={700} />
                 </div>
            </div>
        </div>
    );
};

export default HomeDashboard;
