
import React, { useState } from 'react';
import { getResearchSources } from '../../services/geminiService';
import { ResearchSource } from '../../types';
import FeatureWrapper from '../common/FeatureWrapper';
import LoadingSpinner from '../common/LoadingSpinner';
import { Search, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ResearchAssistant: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<{ text: string; sources: ResearchSource[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useApp();

  const handleSearch = async () => {
    if (!topic.trim()) {
      setError(t('feature.researchAssistant.error.noTopic'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await getResearchSources(topic);
      if (response && (response.text || response.sources.length > 0)) {
        setResult(response);
      } else {
        setError(t('feature.researchAssistant.error.notFound'));
      }
    } catch (err) {
      setError(t('login.error.unexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeatureWrapper
      title={t('feature.researchAssistant.title')}
      description={t('feature.researchAssistant.description')}
    >
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="relative">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('feature.researchAssistant.placeholder')}
            className="w-full bg-slate-50 rounded-full py-3 pr-6 pl-14 rtl:pr-14 rtl:pl-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute left-2 rtl:left-auto rtl:right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 transform active:scale-95"
          >
            {isLoading ? <LoadingSpinner/> : <Search size={20} />}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-md p-8 mt-8 animate-fade-in-up">
          {result.text && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('feature.researchAssistant.summaryTitle')}</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{result.text}</p>
            </div>
          )}
          {result.sources.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{t('feature.researchAssistant.sourcesTitle')}</h3>
              <div className="space-y-4">
                {result.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-indigo-300 transition-colors opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className="font-semibold text-indigo-700">{source.title}</p>
                    <div className="flex items-center mt-1">
                      <LinkIcon size={14} className="text-slate-400 ml-2 rtl:ml-0 rtl:mr-2" />
                      <p className="text-sm text-slate-500 truncate">{source.uri}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </FeatureWrapper>
  );
};

export default ResearchAssistant;
