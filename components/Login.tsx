import React, { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const { handleLogin, t } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      handleLogin(name.trim(), major.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 text-white p-3 rounded-full mb-4">
            <BookMarked size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{t('appName')}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold text-slate-700 text-center mb-6">{t('login.welcomeTitle')}</h2>
          <div className="mb-4">
            <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="name">{t('login.name')}</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              id="name"
              type="text"
              placeholder={t('login.name.placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="major">{t('login.major')}</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              id="major"
              type="text"
              placeholder={t('login.major.placeholder')}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform active:scale-95"
            type="submit"
          >
            {t('login.button.enter')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;