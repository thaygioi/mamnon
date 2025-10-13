import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-500"></div>
      <p className="mt-4 text-lg font-semibold text-slate-700">AI đang vận dụng trí tuệ...</p>
    </div>
  );
};

export default LoadingSpinner;