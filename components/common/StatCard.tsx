import React from 'react';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number, onClick?: () => void }> = ({ icon, label, value, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4 rtl:space-x-reverse animate-fade-in-up transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    onClick={onClick}
    >
    <div className="bg-indigo-100 text-indigo-600 rounded-full p-3">{icon}</div>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default StatCard;
