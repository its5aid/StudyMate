
import React from 'react';
import { useApp } from '../context/AppContext';
import { Rocket, Zap, CheckCircle, Megaphone } from 'lucide-react';
import FeatureWrapper from './common/FeatureWrapper';

const updatesDataEn = [
    {
        icon: <Rocket className="h-6 w-6 text-white" />,
        bgColor: 'bg-indigo-500',
        version: "Version 1.2.0: AI Assistant Upgrade",
        date: "October 10, 2025",
        features: [
            "The AI Assistant can now analyze images (JPG, PNG).",
            "Improved accuracy in lecture summaries.",
            "UI enhancements for a smoother experience."
        ]
    },
    {
        icon: <Zap className="h-6 w-6 text-white" />,
        bgColor: 'bg-amber-500',
        version: "Version 1.1.0: Profile & Dashboard Enhancements",
        date: "September 22, 2025",
        features: [
            "New user profile page with activity stats.",
            "Redesigned Home Dashboard with quick actions.",
            "Added auto-save for profile changes."
        ]
    },
    {
        icon: <Megaphone className="h-6 w-6 text-white" />,
        bgColor: 'bg-green-500',
        version: "Version 1.0.0: Welcome to StudyMate!",
        date: "August 15, 2025",
        features: [
            "Initial release of StudyMate.",
            "Core features: Summarizer, Test Generator, Study Planner, and Research Assistant."
        ]
    }
];

const updatesDataAr = [
    {
        icon: <Rocket className="h-6 w-6 text-white" />,
        bgColor: 'bg-indigo-500',
        version: "الإصدار 1.2.0: ترقية المساعد الذكي",
        date: "10 أكتوبر 2025",
        features: [
            "المساعد الذكي يستطيع الآن تحليل الصور (JPG, PNG).",
            "تحسين دقة ملخصات المحاضرات.",
            "تحسينات في واجهة المستخدم لتجربة أكثر سلاسة."
        ]
    },
    {
        icon: <Zap className="h-6 w-6 text-white" />,
        bgColor: 'bg-amber-500',
        version: "الإصدار 1.1.0: تحسينات الملف الشخصي ولوحة التحكم",
        date: "22 سبتمبر 2025",
        features: [
            "صفحة ملف شخصي جديدة مع إحصائيات النشاط.",
            "إعادة تصميم لوحة التحكم الرئيسية بإجراءات سريعة.",
            "إضافة الحفظ التلقائي لتغييرات الملف الشخصي."
        ]
    },
    {
        icon: <Megaphone className="h-6 w-6 text-white" />,
        bgColor: 'bg-green-500',
        version: "الإصدار 1.0.0: أهلاً بك في StudyMate!",
        date: "15 أغسطس 2025",
        features: [
            "الإصدار الأولي لتطبيق StudyMate.",
            "الميزات الأساسية: ملخص المحاضرات، مولد الاختبارات، منظم الدراسة، ومساعد البحث."
        ]
    }
];

const Updates: React.FC = () => {
    const { t, language } = useApp();
    const updates = language === 'ar' ? updatesDataAr : updatesDataEn;

    return (
        <FeatureWrapper title={t('page.updates.title')} description={t('page.updates.description')}>
            <div className="flow-root">
                <ul className="-mb-8">
                    {updates.map((update, index) => (
                        <li key={index} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                            <div className="relative pb-8">
                                {index !== updates.length - 1 ? (
                                    <span className="absolute top-4 right-4 -mr-px rtl:-mr-0 rtl:-ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex items-start space-x-3 rtl:space-x-reverse">
                                    <div>
                                        <span className={`h-8 w-8 rounded-full ${update.bgColor} flex items-center justify-center ring-8 ring-slate-100`}>
                                            {update.icon}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 bg-white rounded-lg shadow-sm p-4 border border-slate-200">
                                        <div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-md font-bold text-slate-800">{update.version}</p>
                                                <time className="text-xs text-slate-500">{update.date}</time>
                                            </div>
                                            <ul className="mt-3 list-none space-y-2">
                                                {update.features.map((feature, fIndex) => (
                                                    <li key={fIndex} className="flex items-start text-sm">
                                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 rtl:mr-0 rtl:ml-2 mt-0.5 flex-shrink-0" />
                                                        <span className="text-slate-600">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </FeatureWrapper>
    );
};

export default Updates;
