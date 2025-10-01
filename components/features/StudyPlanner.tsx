

import React, { useState } from 'react';
import { generateStudyPlan } from '../../services/geminiService';
import { StudyPlan } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import { CalendarClock, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const StudyPlanner: React.FC = () => {
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [time, setTime] = useState('');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addPlan, t } = useApp();

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };
  
  const addSubject = () => {
      setSubjects([...subjects, '']);
  }

  const removeSubject = (index: number) => {
      setSubjects(subjects.filter((_, i) => i !== index));
  }

  const handleGenerate = async () => {
    const validSubjects = subjects.filter(s => s.trim()).join(', ');
    if (!validSubjects || !time.trim()) {
      setError(t('feature.studyPlanner.error.noInput'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const response = await generateStudyPlan(validSubjects, time);
      setPlan(response);
      addPlan({
          title: `${t('feature.studyPlanner.planTitleFor')} ${validSubjects.split(',')[0]}`,
          date: new Date().toLocaleDateString('ar-EG'),
          data: response
      });
    } catch (err) {
      setError(t('feature.studyPlanner.error.generationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-slate-600 font-medium mb-2">{t('feature.studyPlanner.subjects')}</label>
                <div className="space-y-2">
                    {subjects.map((subject, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => handleSubjectChange(index, e.target.value)}
                                placeholder={t('feature.studyPlanner.subjectPlaceholder', { number: index + 1 })}
                                className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {subjects.length > 1 && <button onClick={() => removeSubject(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><X size={16}/></button>}
                        </div>
                    ))}
                </div>
                <button onClick={addSubject} className="mt-2 flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
                    <Plus size={16}/> {t('feature.studyPlanner.addSubject')}
                </button>
            </div>
          <div>
            <label className="block text-slate-600 font-medium mb-2">{t('feature.studyPlanner.availableTime')}</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder={t('feature.studyPlanner.timePlaceholder')}
              className="w-full px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 transform active:scale-95"
          >
            {isLoading ? <LoadingSpinner/> : <CalendarClock size={18} />}
            <span>{isLoading ? t('feature.studyPlanner.button.loading') : t('feature.studyPlanner.button.generate')}</span>
          </button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {plan && (
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 animate-fade-in-up">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('feature.studyPlanner.planTitle')}</h3>
          <div className="space-y-6">
            {plan.plan.map((day, index) => (
              <div key={index} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h4 className="font-bold text-lg text-indigo-600 mb-3 pb-2 border-b-2 border-indigo-200">{day.day}</h4>
                <div className="flow-root">
                    <ul className="-mb-8">
                        {day.tasks.map((task, taskIndex) => (
                             <li key={taskIndex}>
                                <div className="relative pb-8">
                                    {taskIndex !== day.tasks.length - 1 ? <span className="absolute top-4 right-4 -mr-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                                    <div className="relative flex space-x-3 rtl:space-x-reverse">
                                        <div>
                                            <span className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center ring-4 ring-white">
                                                <CalendarClock className="h-5 w-5 text-slate-500" />
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4 flex-col sm:flex-row">
                                            <div>
                                                <p className="text-sm text-gray-500">{task.task} - <span className="font-medium text-gray-900">{task.subject}</span></p>
                                            </div>
                                            <div className="text-right sm:text-left text-sm whitespace-nowrap text-gray-500 mt-1 sm:mt-0">
                                                <time>{task.time}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;