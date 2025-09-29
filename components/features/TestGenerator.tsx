
import React, { useState } from 'react';
import { generateTest } from '../../services/geminiService';
import { QuizQuestion, QuestionType, MCQQuestion } from '../../types';
import FeatureWrapper from '../common/FeatureWrapper';
import LoadingSpinner from '../common/LoadingSpinner';
import { ClipboardList, UploadCloud, FileText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SUPPORTED_TYPES = ['application/pdf', 'text/plain'];
const SUPPORTED_TYPES_STRING = 'PDF, TXT';

const TestGenerator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const { addTest, addFile, t } = useApp();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (SUPPORTED_TYPES.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError(t('feature.summarizer.error.unsupported', { fileTypes: SUPPORTED_TYPES_STRING }));
        setFile(null);
      }
    }
    e.target.value = ''; // Reset file input
  };

  const handleGenerate = async () => {
    if (!file) {
      setError(t('feature.testGenerator.error.noFile'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setQuestions(null);
    setShowResults(false);
    setAnswers({});

    try {
      const response = await generateTest(file);
      setQuestions(response);
      addTest();
      const fileSize = (file.size / 1024).toFixed(2);
      addFile({ name: file.name, size: `${fileSize} KB`, type: 'test' });
    } catch (err) {
      setError(t('feature.testGenerator.error.generationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [index]: answer }));
  };

  const getResultColor = (q: MCQQuestion, selected: string) => {
    if (!showResults) return 'border-slate-300 hover:border-indigo-400';
    const mcq = q as MCQQuestion;
    const isCorrect = mcq.correctAnswer === selected;
    const isSelected = answers[questions?.indexOf(q) ?? -1] === selected;

    if (isCorrect) return 'border-green-500 bg-green-50';
    if (isSelected && !isCorrect) return 'border-red-500 bg-red-50';
    return 'border-slate-300';
}

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <FeatureWrapper
      title={t('feature.testGenerator.title')}
      description={t('feature.testGenerator.description', { fileTypes: SUPPORTED_TYPES_STRING })}
    >
      <div className="bg-white rounded-xl shadow-md p-8">
        {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">{t('feature.summarizer.upload.click')}</span> {t('feature.summarizer.upload.drag')}</p>
                    <p className="text-xs text-slate-400">{SUPPORTED_TYPES_STRING}</p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} accept={SUPPORTED_TYPES.join(',')} />
            </label>
        ) : (
            <div className="flex items-center justify-between w-full h-48 p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <div className="flex items-center gap-4">
                    <FileText className="w-10 h-10 text-indigo-600"/>
                    <div>
                        <p className="font-semibold text-slate-800">{file.name}</p>
                        <p className="text-sm text-slate-500">{formatBytes(file.size)}</p>
                    </div>
                </div>
                <button onClick={() => setFile(null)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>
        )}
        <div className="flex justify-end mt-4">
            <button
            onClick={handleGenerate}
            disabled={isLoading || !file}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 transform active:scale-95"
            >
            {isLoading ? <LoadingSpinner/> : <ClipboardList size={18} />}
            <span>{isLoading ? t('feature.testGenerator.button.loading') : t('feature.testGenerator.button.generate')}</span>
            </button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {questions && (
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">{t('feature.testGenerator.quizTitle')}</h3>
            <div className="space-y-8">
                {questions.map((q, index) => (
                    <div key={index} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                        <p className="font-semibold text-slate-700 mb-4">{index + 1}. {q.question}</p>
                        {q.type === QuestionType.MCQ && (
                            <div className="space-y-3">
                                {(q as MCQQuestion).options.map((opt, i) => (
                                    <label key={i} className={`block p-3 border rounded-lg cursor-pointer transition-all duration-300 ${getResultColor(q as MCQQuestion, opt)}`}>
                                        <input type="radio" name={`q${index}`} value={opt} onChange={(e) => handleAnswerChange(index, e.target.value)} checked={answers[index] === opt} className="mr-3 rtl:mr-0 rtl:ml-3 accent-indigo-600" disabled={showResults} />
                                        {opt}
                                    </label>
                                ))}
                                {showResults && <p className="text-sm mt-3 text-green-700 font-semibold">{t('feature.testGenerator.correctAnswer')} {(q as MCQQuestion).correctAnswer}</p>}
                            </div>
                        )}
                        {q.type === QuestionType.Essay && (
                            <textarea placeholder={t('feature.testGenerator.essayPlaceholder')} className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                        )}
                    </div>
                ))}
            </div>
             <div className="mt-8 flex justify-between items-center">
                {showResults && (
                    <button onClick={() => { setShowResults(false); setAnswers({}); }} className="bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 transition-all duration-200 transform active:scale-95">
                        {t('feature.testGenerator.retry')}
                    </button>
                )}
                {!showResults && (
                    <button onClick={() => setShowResults(true)} className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 transform active:scale-95 ml-auto rtl:ml-0 rtl:mr-auto">
                        {t('feature.testGenerator.showResults')}
                    </button>
                )}
            </div>
        </div>
      )}
    </FeatureWrapper>
  );
};

export default TestGenerator;
