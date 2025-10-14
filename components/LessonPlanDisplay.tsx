import React, { useState, useRef, useEffect } from 'react';
import { LessonPlanParts, ChatMessage } from '../types';

interface LessonPlanDisplayProps {
  lessonPlanParts: LessonPlanParts | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isChatLoading: boolean;
  format: 'no-columns' | 'with-columns';
}

interface ActivityRow {
  title: string;
  teacherActions: string[];
  childActions: string[];
}

// Helper function to convert simple markdown bold to HTML
const markdownToHtml = (text: string) => {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const parseColumnContent = (text: string): ActivityRow[] => {
    const rows: ActivityRow[] = [];
    if (!text) return rows;

    const lines = text.split('\n');
    let currentRow: ActivityRow | null = null;
    let currentSection: 'teacher' | 'child' | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        // Check for activity titles (e.g., **1. Khởi động:**)
        if (trimmedLine.startsWith('**') && (trimmedLine.includes('. ') || trimmedLine.match(/^\*\*\d+:/))) {
            if (currentRow) {
                rows.push(currentRow);
            }
            // Store the raw line with markdown as the title
            currentRow = { title: trimmedLine, teacherActions: [], childActions: [] };
            currentSection = null;
        } else if (trimmedLine.startsWith('**Hoạt động của cô:**')) {
            currentSection = 'teacher';
        } else if (trimmedLine.startsWith('**Hoạt động của trẻ:**')) {
            currentSection = 'child';
        } else if (currentRow && trimmedLine) {
            // Store the raw line with markdown for teacher/child actions
            if (currentSection === 'teacher') {
                currentRow.teacherActions.push(trimmedLine);
            } else if (currentSection === 'child') {
                currentRow.childActions.push(trimmedLine);
            }
        }
    }

    if (currentRow) {
        rows.push(currentRow);
    }
    return rows;
}


const FormattedContent: React.FC<{ text: string; format: 'no-columns' | 'with-columns' }> = ({ text, format }) => {
  if (!text) return null;

  const sections = text.split('**III. TỔ CHỨC HOẠT ĐỘNG**');
  if (sections.length < 2) {
     sections[1] = text.split('**III. CÁCH TIẾN HÀNH**')[1];
     if (!sections[1]) {
        // Fallback if no activity section is found
         return (
            <div className="prose prose-slate max-w-none">
                {text.split('\n').map((line, index) => (
                    <p key={index} dangerouslySetInnerHTML={{ __html: markdownToHtml(line) || '&nbsp;' }} />
                ))}
            </div>
        );
     }
  }

  const preActivitiesContent = sections[0];
  const activitiesContent = sections[1] || '';

  const renderSimpleFormat = (content: string) => {
    return content.split('\n').map((line, index) => {
        const sanitizedLine = markdownToHtml(line);
        if (line.trim().startsWith('-')) {
          return <p key={index} className="pl-6 relative"><span className="absolute left-2 top-2 text-xs">&bull;</span><span dangerouslySetInnerHTML={{ __html: sanitizedLine.substring(1).trim() }} /></p>;
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: sanitizedLine || '&nbsp;' }} />;
    });
  }

  return (
    <div className="prose prose-slate max-w-none leading-relaxed">
      {renderSimpleFormat(preActivitiesContent)}

      <p><strong>III. TỔ CHỨC HOẠT ĐỘNG</strong></p>

      {format === 'with-columns' ? (
        <table className="w-full border-collapse border border-slate-400">
            <thead>
                <tr className="bg-slate-100">
                    <th className="w-1/2 border border-slate-300 px-4 py-2 text-left font-bold text-slate-800">Hoạt động của cô</th>
                    <th className="w-1/2 border border-slate-300 px-4 py-2 text-left font-bold text-slate-800">Hoạt động của trẻ</th>
                </tr>
            </thead>
            <tbody>
                {parseColumnContent(activitiesContent).map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {row.title && (
                            <tr className="bg-slate-50">
                                <td colSpan={2} className="border border-slate-300 px-4 py-2"
                                  dangerouslySetInnerHTML={{ __html: markdownToHtml(row.title) }}>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td className="border border-slate-300 px-4 py-2 align-top">
                                {row.teacherActions.map((action, i) => <p key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(action) }} />)}
                            </td>
                            <td className="border border-slate-300 px-4 py-2 align-top">
                                {row.childActions.map((action, i) => <p key={i} dangerouslySetInnerHTML={{ __html: markdownToHtml(action) }} />)}
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
            </tbody>
        </table>
      ) : (
        renderSimpleFormat(activitiesContent)
      )}
    </div>
  );
};

const formatTextForDoc = (text: string, format: 'no-columns' | 'with-columns'): string => {
    if (!text) return '';
    
    let htmlContent = '';
    const sections = text.split('**III. TỔ CHỨC HOẠT ĐỘNG**');
     if (sections.length < 2) {
        sections[0] = text.split('**III. CÁCH TIẾN HÀNH**')[0];
        sections[1] = text.split('**III. CÁCH TIẾN HÀNH**')[1];
    }
    const preActivitiesContent = sections[0];
    const activitiesContent = sections[1] || '';

    const simpleFormatToHtml = (content: string) => {
        return content.split('\n').map(line => {
            if (line.trim() === '') return '<br>';
            let styledLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5;">${styledLine}</p>`;
        }).join('');
    };
    
    htmlContent += simpleFormatToHtml(preActivitiesContent);
    htmlContent += `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5;"><strong>III. TỔ CHỨC HOẠT ĐỘNG</strong></p>`;

    if (format === 'with-columns' && activitiesContent) {
        let tableHtml = `<table style="width:100%; border-collapse: collapse; border: 1px solid #ccc;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="width:50%; border: 1px solid #ccc; padding: 8px; text-align: left;">Hoạt động của cô</th>
                    <th style="width:50%; border: 1px solid #ccc; padding: 8px; text-align: left;">Hoạt động của trẻ</th>
                </tr>
            </thead>
            <tbody>`;
        
        parseColumnContent(activitiesContent).forEach(row => {
            if (row.title) {
                tableHtml += `<tr style="background-color: #f9f9f9;"><td colspan="2" style="border: 1px solid #ccc; padding: 8px; font-weight: bold;">${markdownToHtml(row.title)}</td></tr>`;
            }
            tableHtml += `<tr>
                <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">${row.teacherActions.map(a => `<p>${markdownToHtml(a)}</p>`).join('')}</td>
                <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">${row.childActions.map(a => `<p>${markdownToHtml(a)}</p>`).join('')}</td>
            </tr>`;
        });

        tableHtml += `</tbody></table>`;
        htmlContent += tableHtml;
    } else {
        htmlContent += simpleFormatToHtml(activitiesContent);
    }
    
    return htmlContent;
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
      <div className="h-64 overflow-y-auto space-y-4 pr-2">
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


export const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({ lessonPlanParts, chatHistory, onSendMessage, isChatLoading, format }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  useEffect(() => {
    if (lessonPlanParts) {
      setCopyStatus('idle');
    }
  }, [lessonPlanParts]);

  const handleCopy = () => {
    if (lessonPlanParts) {
      navigator.clipboard.writeText(lessonPlanParts.lessonPlanContent).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
    }
  };
  
  const handleDownload = () => {
    if (!lessonPlanParts) return;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Giáo án</title>
        <style>
          body { font-family: 'Times New Roman', serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; }
          p { margin: 0 0 0.5em 0; }
        </style>
      </head>
      <body>
        ${formatTextForDoc(lessonPlanParts.lessonPlanContent, format)}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
    });
    
    let fileName = 'GiaoAn.doc';
    const subjectMatch = lessonPlanParts.lessonPlanContent.match(/Đề tài\s*:\s*(.*)/);
    if (subjectMatch && subjectMatch[1]) {
        const subject = subjectMatch[1].trim().replace(/\s+/g, '_');
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
        <p className="mt-2 max-w-md">Điền thông tin và nhấn "Tạo giáo án với AI" để bắt đầu sáng tạo.</p>
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
      <div className="p-6 sm:p-8 overflow-y-auto flex-grow" style={{maxHeight: '60vh'}}>
        <FormattedContent text={lessonPlanParts.lessonPlanContent} format={format} />
      </div>

      {/* Chat Interface */}
       <ChatInterface history={chatHistory} onSendMessage={onSendMessage} isLoading={isChatLoading} />
    </div>
  );
};