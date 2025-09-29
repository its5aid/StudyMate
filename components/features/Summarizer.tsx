import React, { useState } from 'react';
import { generateSummaryAndFlashcards } from '../../services/geminiService';
import { SummaryResult } from '../../types';
import FeatureWrapper from '../common/FeatureWrapper';
import LoadingSpinner from '../common/LoadingSpinner';
import { UploadCloud, Zap, FileText, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import FileUploadProgress from '../common/FileUploadProgress';

const SUPPORTED_TYPES = ['application/pdf', 'text/plain'];
const SUPPORTED_TYPES_STRING = 'PDF, TXT';
type UploadStatus = 'idle' | 'uploading' | 'generating' | 'error' | 'success';

const Summarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards'>('summary');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const { addFile, t } = useApp();

  const resetGenerationState = () => {
    setResult(null);
    setIsLoading(false);
    setError(null);
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      resetGenerationState();
      const selectedFile = e.target.files[0];
      if (SUPPORTED_TYPES.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        setFile(null);
        setError(t('feature.summarizer.error.unsupported', { fileTypes: SUPPORTED_TYPES_STRING }));
      }
    }
    e.target.value = '';
  };
  
  const handleClearFile = () => {
    setFile(null);
    resetGenerationState();
  };


  const handleGenerate = async () => {
    if (!file) {
      setError(t('feature.summarizer.error.noFile'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setUploadStatus('uploading');

    try {
      const onProgress = (progress: number) => {
          setUploadProgress(progress);
          if (progress === 100) {
              setUploadStatus('generating');
          }
      };

      const response = await generateSummaryAndFlashcards(file, onProgress);
      setResult(response);
      setUploadStatus('success');
      const fileSize = (file.size / 1024).toFixed(2);
      addFile({ name: file.name, size: `${fileSize} KB`, type: 'summary' });
    } catch (err) {
      console.error(err);
      setError(t('feature.summarizer.error.generationFailed'));
      setUploadStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

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
      title={t('feature.summarizer.title')}
      description={t('feature.summarizer.description', { fileTypes: SUPPORTED_TYPES_STRING })}
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
             <div className="p-4 border-2 border-indigo-500 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <FileText className="w-10 h-10 text-indigo-600 flex-shrink-0"/>
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{file.name}</p>
                            <p className="text-sm text-slate-500">{formatBytes(file.size)}</p>
                        </div>
                    </div>
                    <button onClick={handleClearFile} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors flex-shrink-0 ml-2">
                        <X size={20} />
                    </button>
                </div>
                {(isLoading || uploadStatus === 'error') && uploadStatus !== 'idle' && (
                    <FileUploadProgress 
                        progress={uploadProgress}
                        status={uploadStatus}
                        fileName={file.name}
                        t={t}
                    />
                )}
            </div>
        )}

        <div className="flex justify-end mt-4">
            <button
            onClick={handleGenerate}
            disabled={isLoading || !file}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 transform active:scale-95"
            >
            {isLoading ? <LoadingSpinner/> : <Zap size={18} />}
            <span>{isLoading ? t('feature.summarizer.button.loading') : t('feature.summarizer.button.generate')}</span>
            </button>
        </div>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 animate-fade-in-up">
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
                    <button onClick={() => setActiveTab('summary')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${activeTab === 'summary' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('feature.summarizer.tab.summary')}
                    </button>
                    <button onClick={() => setActiveTab('flashcards')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${activeTab === 'flashcards' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        {t('feature.summarizer.tab.flashcards', { count: result.flashcards.length })}
                    </button>
                </nav>
            </div>

            {activeTab === 'summary' && (
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('feature.summarizer.summaryTitle')}</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                </div>
            )}
            
            {activeTab === 'flashcards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.flashcards.map((card, index) => (
                        <div key={index} className="group [perspective:1000px]">
                            <div className="relative h-48 w-full rounded-xl shadow-md transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                                <div className="absolute inset-0 bg-indigo-500 rounded-xl flex items-center justify-center p-4 text-center">
                                    <p className="text-white font-semibold">{card.question}</p>
                                </div>
                                <div className="absolute inset-0 bg-white rounded-xl [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center p-4 text-center">
                                     <p className="text-slate-700">{card.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </FeatureWrapper>
  );
};

export default Summarizer;