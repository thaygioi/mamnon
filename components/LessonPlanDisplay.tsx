import React, { useState, useEffect, useRef } from 'react';
import { LessonPlanParts, ChatMessage } from '../types';

interface LessonPlanDisplayProps {
  lessonPlanParts: LessonPlanParts | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
}

const FormattedContent: React.FC<{ text: string }> = ({ text }) => {
  if (!text) {
    return null;
  }
  
  return (
    <div className="text-slate-800 leading-relaxed text-base font-sans">
      {text.split('\n').map((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
          return <div key={index} className="h-4" />;
        }
        if (trimmedLine === '---') {
          return <hr key={index} className="my-4 border-slate-300" />;
        }
        if (trimmedLine === 'GIÁO ÁN' || trimmedLine.startsWith('GỢI Ý HOẠT ĐỘNG')) {
          return <p key={index} className="text-center font-bold uppercase text-lg my-2 text-slate-900">{trimmedLine}</p>;
        }
        if (trimmedLine.startsWith('LĨNH VỰC PHÁT TRIỂN')) {
            return <p key={index} className="text-center font-bold uppercase text-base mb-4 text-slate-800">{trimmedLine}</p>;
        }
        if (/^[IVXLCDM]+\..+$/.test(trimmedLine)) {
            return <p key={index} className="font-bold text-base mt-4 mb-2 text-slate-900">{trimmedLine}</p>;
        }
        if (/^\d+\..+$/.test(trimmedLine) || trimmedLine.toLowerCase().startsWith('hoạt động')) {
            return <p key={index} className="font-bold mt-3 mb-1 text-slate-800">{trimmedLine}</p>;
        }
        if (trimmedLine.startsWith('- ')) {
           return (
             <p key={index} className="pl-6 relative">
               <span className="absolute left-1.5 top-2 text-xs">&bull;</span>
               {trimmedLine.substring(2)}
             </p>
           );
        }
        
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > 0 && colonIndex < 40 && !trimmedLine.substring(0, colonIndex).includes(' ')) {
             const key = trimmedLine.substring(0, colonIndex + 1);
             const value = trimmedLine.substring(colonIndex + 1);
             return (
                <p key={index} className="mb-1">
                    <span className="font-semibold">{key}</span>
                    {value}
                </p>
            );
        }

        return <p key={index} className="mb-1">{trimmedLine}</p>;
      })}
    </div>
  );
};

const formatTextForDoc = (text: string): string => {
    if (!text) return '';
    const styles = {
      h1: 'text-align: center; font-size: 18pt; font-weight: bold; text-transform: uppercase; margin: 1em 0;',
      h2: 'text-align: center; font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1em;',
      h3: 'font-size: 15pt; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em;',
      h4: 'font-size: 14pt; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em;',
      p: 'font-size: 14pt; margin-bottom: 0.5em; line-height: 1.5;',
      li: 'font-size: 14pt; margin-left: 40px; margin-bottom: 0.5em; line-height: 1.5;',
    };

    return text.split('\n').map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine === '') return '<br>';
      if (trimmedLine === '---') return '<hr style="margin: 1em 0;" />';
      if (trimmedLine === 'GIÁO ÁN' || trimmedLine.startsWith('GỢI Ý HOẠT ĐỘNG')) {
        return `<p style="${styles.h1}">${trimmedLine}</p>`;
      }
      if (trimmedLine.startsWith('LĨNH VỰC PHÁT TRIỂN')) {
        return `<p style="${styles.h2}">${trimmedLine}</p>`;
      }
      if (/^[IVXLCDM]+\..+$/.test(trimmedLine)) {
        return `<p style="${styles.h3}">${trimmedLine}</p>`;
      }
      if (/^\d+\..+$/.test(trimmedLine) || trimmedLine.toLowerCase().startsWith('hoạt động')) {
        return `<p style="${styles.h4}">${trimmedLine}</p>`;
      }
      if (trimmedLine.startsWith('- ')) {
        return `<p style="${styles.li}">&bull; ${trimmedLine.substring(2)}</p>`;
      }
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0 && colonIndex < 40 && !trimmedLine.substring(0, colonIndex).includes(' ')) {
        const key = trimmedLine.substring(0, colonIndex + 1);
        const value = trimmedLine.substring(colonIndex + 1);
        return `<p style="${styles.p}"><strong>${key}</strong>${value}</p>`;
      }

      return `<p style="${styles.p}">${trimmedLine}</p>`;
    }).join('');
};


const ChatInterface: React.FC<{
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}> = ({ history, onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t border-slate-200/80 p-4 bg-slate-50/50">
      <div className="h-48 overflow-y-auto space-y-4 pr-2">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && <i className="fas fa-robot text-teal-500 text-lg mb-1"></i>}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-cyan-500 text-white rounded-br-none'
                : 'bg-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
             {msg.role === 'user' && <i className="fas fa-user text-cyan-500 text-lg mb-1"></i>}
          </div>
        ))}
        {isLoading && (
           <div className="flex items-end gap-2 justify-start">
             <i className="fas fa-robot text-teal-500 text-lg mb-1"></i>
            <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-slate-200 text-slate-800 rounded-bl-none">
               <div className="flex items-center space-x-1">
                 <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce"></span>
               </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Yêu cầu AI chỉnh sửa giáo án..."
          disabled={isLoading}
          className="flex-grow block w-full px-4 py-2 bg-white border border-slate-300 rounded-full shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition disabled:bg-slate-100"
        />
        <button type="submit" disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg transform hover:scale-110 transition-all duration-200 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:scale-100">
           <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}


export const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ lessonPlanParts, chatHistory, onSendMessage, isChatLoading }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (lessonPlanParts) {
      setCopyStatus('idle');
    }
  }, [lessonPlanParts]);

  const handleCopy = () => {
    if (lessonPlanParts?.lessonPlanContent) {
      navigator.clipboard.writeText(lessonPlanParts.lessonPlanContent).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
    }
  };
  
  const handleDownload = () => {
    if (!lessonPlanParts?.lessonPlanContent) return;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Giáo án</title>
        <style>
          body { font-family: 'Times New Roman', serif; }
        </style>
      </head>
      <body>
        ${formatTextForDoc(lessonPlanParts.lessonPlanContent)}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
    });
    
    let fileName = 'GiaoAn.doc';
    const lines = lessonPlanParts.lessonPlanContent.split('\n');
    const subjectLine = lines.find(line => line.includes('Đề tài:'));
    if (subjectLine) {
        const subject = subjectLine.split(':')[1].trim().replace(/\s+/g, '_');
        fileName = `GiaoAn_${subject}.doc`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (!lessonPlanParts) {
    return (
       <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-8 rounded-2xl shadow-lg text-center text-slate-500 h-full flex flex-col justify-center items-center transition-all duration-300">
        <div className="text-6xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
            <i className="fas fa-book-open-reader"></i>
        </div>
        <h3 className="text-2xl font-semibold text-slate-700">Giáo án của bạn sẽ xuất hiện ở đây</h3>
        <p className="mt-2 max-w-md">Kế hoạch chi tiết cho các hoạt động sẽ được AI tạo ra và hiển thị tại đây.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg h-full flex flex-col">
      {/* Header with actions */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200/80">
        <h2 className="text-xl font-bold text-slate-800">Kế hoạch Giảng dạy</h2>
        <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <i className={`fas ${copyStatus === 'copied' ? 'fa-check' : 'fa-copy'}`}></i>
              <span>{copyStatus === 'copied' ? 'Đã chép!' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white"
            >
              <i className="fas fa-file-word"></i>
              <span>Tải về (.doc)</span>
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 overflow-y-auto flex-grow" style={{maxHeight: '70vh'}}>
        <FormattedContent text={lessonPlanParts.lessonPlanContent} />
      </div>

      {/* Chat Interface */}
       <ChatInterface history={chatHistory} onSendMessage={onSendMessage} isLoading={isChatLoading} />
    </div>
  );
};