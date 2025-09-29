
import React, { useState, useEffect } from 'react';
import { BookMarked, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  type View = 'login' | 'signup' | 'forgotPassword' | 'resetPassword';

  const [view, setView] = useState<View>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login, signup, checkEmailExists, resetPassword, t } = useApp();

  const clearFormState = () => {
    setName('');
    setMajor('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setError(null);
    setSuccess(null);
  };
  
  const handleViewChange = (newView: View) => {
    clearFormState();
    setView(newView);
  }

  useEffect(() => {
      if(error) setError(null);
      if(success) setSuccess(null);
  }, [name, email, major, password, newPassword, confirmPassword, verificationCode]);

  const handleLoginSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const result = view === 'login'
        ? await login(email, password)
        : await signup(name, email, password, major);
      if (!result.success) setError(result.message);
    } catch (err) {
      setError(t('login.error.unexpected'));
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const emailExists = await checkEmailExists(email);
    if (!emailExists) {
      setError(t('login.error.emailNotFound'));
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    setSuccess(t('login.success.codeSent.simulated', { code }));
    setView('resetPassword');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (verificationCode !== sentCode) {
      setError(t('login.error.codeIncorrect'));
      return;
    }
    if (newPassword.length < 6) {
        setError(t('login.error.passwordLength'));
        return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('login.error.passwordMismatch'));
      return;
    }

    const result = await resetPassword(email, newPassword);
    if (result.success) {
      setView('login');
      setEmail(email);
      setSuccess(result.message + ` ${t('login.title')}`);
    } else {
      setError(result.message);
    }
  };

  const renderMessages = () => (
      <>
        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center" role="alert">
                <AlertCircle className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0"/>
                <span className="block sm:inline text-sm">{error}</span>
            </div>
        )}
        {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative mb-4 flex items-center" role="alert">
                <CheckCircle2 className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0"/>
                <span className="block sm:inline text-sm">{success}</span>
            </div>
        )}
      </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-12 animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 text-white p-3 rounded-full mb-4">
            <BookMarked size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{t('appName')}</h1>
          <p className="text-slate-500 mt-2">{t('appSlogan')}</p>
        </div>

        { (view === 'login' || view === 'signup') && (
            <form onSubmit={handleLoginSignup}>
                 <h2 className="text-2xl font-semibold text-slate-700 text-center mb-6">{view === 'login' ? t('login.title') : t('signup.title')}</h2>
                 {renderMessages()}
                {view === 'signup' && (
                  <>
                    <div className="mb-4">
                        <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="name">{t('login.name')}</label>
                        <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="name" type="text" placeholder={t('login.name.placeholder')} value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="major">{t('login.major')}</label>
                        <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="major" type="text" placeholder={t('login.major.placeholder')} value={major} onChange={(e) => setMajor(e.target.value)} />
                    </div>
                  </>
                )}
                <div className="mb-4">
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="email">{t('login.email')}</label>
                    <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="email" type="email" placeholder={t('login.email.placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-6">
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="password">{t('login.password')}</label>
                    <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="password" type="password" placeholder={t('login.password.placeholder')} value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {view === 'login' && <button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-sm text-indigo-600 hover:text-indigo-500 mb-4 float-right rtl:float-left">{t('login.forgotPasswordLink')}</button>}
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform active:scale-95" type="submit">{view === 'login' ? t('login.button.login') : t('login.button.signup')}</button>
                <p className="text-center text-sm text-slate-500 mt-6">
                    {view === 'login' ? t('login.noAccount') : t('login.hasAccount')}{' '}
                    <button type="button" onClick={() => handleViewChange(view === 'login' ? 'signup' : 'login')} className="font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none">{view === 'login' ? t('login.noAccount.link') : t('login.hasAccount.link')}</button>
                </p>
            </form>
        )}

        { view === 'forgotPassword' && (
            <form onSubmit={handleSendCode}>
                 <h2 className="text-2xl font-semibold text-slate-700 text-center mb-2">{t('forgotPassword.title')}</h2>
                 <p className="text-slate-500 text-center text-sm mb-6">{t('forgotPassword.prompt')}</p>
                 {renderMessages()}
                <div className="mb-4">
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="email-forgot">{t('login.email')}</label>
                    <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="email-forgot" type="email" placeholder={t('login.email.placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform active:scale-95 mt-4" type="submit">{t('login.button.sendCode')}</button>
                 <p className="text-center text-sm text-slate-500 mt-6">
                    {t('login.rememberedPassword')}{' '}
                    <button type="button" onClick={() => handleViewChange('login')} className="font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none">{t('login.rememberedPassword.link')}</button>
                </p>
            </form>
        )}

        { view === 'resetPassword' && (
             <form onSubmit={handleResetPassword}>
                 <h2 className="text-2xl font-semibold text-slate-700 text-center mb-6">{t('resetPassword.title')}</h2>
                 {renderMessages()}
                <div className="mb-4">
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="code">{t('login.verificationCode')}</label>
                    <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="code" type="text" placeholder={t('login.verificationCode.placeholder')} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="new-password">{t('login.newPassword')}</label>
                    <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="new-password" type="password" placeholder={t('login.password.placeholder')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                 <div className="mb-6">
                    <label className="block text-slate-600 text-sm font-medium mb-2" htmlFor="confirm-password">{t('login.confirmPassword')}</label>
                    <input className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" id="confirm-password" type="password" placeholder={t('login.password.placeholder')} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform active:scale-95" type="submit">{t('login.button.changePassword')}</button>
            </form>
        )}
        
        { (view === 'login' || view === 'signup') && (
            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    {t('login.disclaimer')}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;
