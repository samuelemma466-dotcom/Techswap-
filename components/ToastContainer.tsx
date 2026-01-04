
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastNotification; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-emerald-500',
    error: 'bg-white border-l-4 border-red-500',
    info: 'bg-white border-l-4 border-indigo-500'
  };

  return (
    <div className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-lg shadow-xl border border-slate-100 flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-right-full ${bgColors[toast.type]}`}>
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 capitalize">{toast.type}</p>
        <p className="text-sm text-slate-500 leading-snug">{toast.message}</p>
      </div>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
