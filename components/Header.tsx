

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';


interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, t } = useApp();
  
  return (
    <header className="flex-shrink-0 flex items-center justify-between h-20 bg-white border-b border-slate-200 px-4 sm:px-8">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="lg:hidden text-slate-600 mr-4 rtl:mr-0 rtl:ml-4">
            <Menu size={24} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder={t('header.search')}
            className="bg-slate-100 rounded-full py-2 pr-8 rtl:pr-4 rtl:pl-10 w-48 sm:w-64 focus:w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-5 rtl:space-x-reverse">
        <button className="relative text-slate-500 hover:text-indigo-600 transition-transform duration-200 ease-in-out hover:rotate-12">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="w-10 h-10">
          <img
            className="rounded-full w-full h-full object-cover"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=6366f1&color=fff&font-size=0.4`}
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
