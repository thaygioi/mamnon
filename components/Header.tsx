import React from 'react';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenApiKeyModal }) => {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
      <div className="container mx-auto px-4 sm:px-6 lg:p-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
             <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                <i className="fas fa-feather-alt"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Trình tạo <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600">Giáo án Mầm non</span>
            </h1>
          </div>
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Cài đặt API Key của bạn"
          >
            <i className="fas fa-key"></i>
            <span>Cài đặt API Key</span>
          </button>
        </div>
      </div>
    </header>
  );
};
