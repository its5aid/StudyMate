
import React from 'react';

interface FeatureWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const FeatureWrapper: React.FC<FeatureWrapperProps> = ({ title, description, children }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 mt-2">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default FeatureWrapper;
