import React from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

type UploadStatus = 'uploading' | 'generating' | 'error' | 'success';

interface FileUploadProgressProps {
  progress: number;
  status: UploadStatus;
  fileName: string;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({ progress, status, fileName, t }) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return t('feature.upload.status.uploading', { fileName });
      case 'success':
        return t('feature.upload.status.success');
      case 'generating':
        return t('feature.upload.status.generating');
      case 'error':
        return t('feature.upload.status.error');
      default:
        return '';
    }
  };

  const getIcon = () => {
    if (status === 'success' || (status === 'generating' && progress === 100)) {
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status === 'error') {
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
     if (status === 'generating') {
        return <Loader className="w-5 h-5 text-indigo-500 animate-spin" />;
    }
    return null;
  }
  
  const progressColor = status === 'error' ? 'bg-red-500' : 'bg-indigo-600';

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center text-sm">
          <p className="text-slate-600 font-medium">{getStatusMessage()}</p>
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-semibold text-slate-700">{progress}%</span>
          </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ${progressColor}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FileUploadProgress;
