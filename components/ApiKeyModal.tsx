
import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
  isInitialSetup?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey, isInitialSetup = false }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    setApiKey(currentKey);
  }, [currentKey, isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity" 
        onClick={isInitialSetup ? undefined : onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md m-4 transform transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Cài đặt API Key</h2>
            {!isInitialSetup && (
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <i className="fas fa-times fa-lg"></i>
                </button>
            )}
        </div>
        <p className="text-slate-600 mb-6 text-sm">
          Vui lòng nhập API key.
        </p>
        
        <div>
          <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-700 mb-1">
            Gemini API Key
          </label>
          <input
            id="apiKeyInput"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Dán API Key của bạn vào đây"
            className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto py-2 px-6 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300"
          >
            <i className="fas fa-save mr-2"></i>
            {isInitialSetup ? 'Lưu và Bắt đầu' : 'Lưu và Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};
