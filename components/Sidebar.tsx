

import React, { useState } from 'react';
import { BookMarked, ChevronLeft, LogOut } from 'lucide-react';
import { Page, Feature } from '../types';
import { useApp } from '../context/AppContext';

interface NavItem {
    id: Feature | 'profile';
    name: string;
    icon: React.ReactNode;
    page: Page;
}

interface SidebarProps {
  navItems: NavItem[];
  profileItem: NavItem;
  activeItem: string;
  setActiveItem: (page: Page, feature?: Feature) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, profileItem, activeItem, setActiveItem, isSidebarOpen, setIsSidebarOpen, logout }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { t } = useApp();

  const NavLink: React.FC<{ item: NavItem, isButton?: boolean, onClick?: () => void }> = ({ item, isButton = true, onClick }) => {
    const isActive = activeItem === item.id;
    const action = onClick ? onClick : () => setActiveItem(item.page, item.id as Feature);
    
    const classes = `flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 transform active:scale-95 whitespace-nowrap ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg'
            : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
        }`;

    return isButton ? (
        <button onClick={action} className={classes}>
            {item.icon}
            <span className={`mr-4 rtl:mr-0 rtl:ml-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>{item.name}</span>
        </button>
    ) : (
        <div className={classes}>
            {item.icon}
            <span className={`mr-4 rtl:mr-0 rtl:ml-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>{item.name}</span>
        </div>
    );
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`fixed lg:relative z-40 flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out h-full
        right-0 lg:right-auto
        ${isExpanded ? 'w-64' : 'w-20'}
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
          <div className="flex items-center justify-between h-20 border-b border-slate-200 px-4 flex-shrink-0">
              <div className={`flex items-center ${isExpanded ? '' : 'justify-center w-full'}`}>
                  <div className="bg-indigo-600 text-white p-2 rounded-lg">
                      <BookMarked size={24} />
                  </div>
                  <span className={`text-xl font-bold text-slate-800 mr-3 rtl:mr-0 rtl:ml-3 transition-all duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>{t('appName')}</span>
              </div>
               <button onClick={() => setIsExpanded(!isExpanded)} className={`hidden lg:block p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}>
                  <ChevronLeft size={18}/>
               </button>
          </div>

        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-slate-200 flex-shrink-0 space-y-3">
          <NavLink item={profileItem} />
           <button onClick={logout} className="flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200 transform active:scale-95 whitespace-nowrap">
                <LogOut size={22} />
                <span className={`mr-4 rtl:mr-0 rtl:ml-4 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'}`}>{t('sidebar.logout')}</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;