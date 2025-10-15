
import React, { useState, useRef, useEffect } from 'react';
import { LessonPlanParts, ChatMessage } from '../types';

type Tab = 'learning' | 'outdoor' | 'corner';

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

// Helper to format markdown-like syntax to HTML
const formatMarkdown = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

const parseColumnContent = (text: string): ActivityRow[] => {
    const rows: ActivityRow[] = [];
    if (!text) return rows;

    const lines = text.split('\n');
    let currentRow: ActivityRow | null = null;
    let currentSection: 'teacher' | 'child' | null = null;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.match(/^\*\*\d+\./) || (trimmedLine.startsWith('- ') && trimmedLine.match(/- \d+\./)) ) {
            if (currentRow) {
                rows.push(currentRow);
            }
            currentRow = { title: trimmedLine, teacherActions: [], childActions: [] };
            currentSection = null; 
        } else if (trimmedLine.toLowerCase().includes('hoạt động của cô')) {
            currentSection = 'teacher';
        } else if (trimmedLine.toLowerCase().includes('hoạt động của trẻ')) {
            currentSection = 'child';
        } else if (currentRow) {
            if (currentSection === 'teacher') {
                currentRow.teacherActions.push(line); // Push original line to preserve indentation
            } else if (currentSection === 'child') {
                currentRow.childActions.push(line); // Push original line
            }
        }
    }

    if (currentRow) {
        rows.push(currentRow);
    }
    return rows;
}

const ContentRenderer: React.FC<{ text: string }> = ({ text }) => {
    if (!text) return null;

    const lines = text.split('\n');
    // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const output: React.ReactElement[] = [];
    let inNumberedList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            output.push(<br key={i} />);
            continue;
        }

        if (trimmed.match(/^(I{1,3}|IV|V|VI|VII|VIII|IX|X)\./)) {
            inNumberedList = false;
            output.push(<p key={i}><strong dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed) }} /></p>);
        } 
        else if (trimmed.match(/^\d+\./) || trimmed.match(/^\*\*\d+\./)) {
            inNumberedList = true;
            output.push(<p key={i}><strong dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed) }} /></p>);
        } 
        else if (trimmed.startsWith('-')) {
            inNumberedList = false;
            output.push(
                <p key={i} className="pl-6 relative">
                    <span className="absolute left-2 top-1 text-slate-700">-</span>
                    <span dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed.substring(1).trim()) }} />
                </p>
            );
        } 
        else if (inNumberedList) {
            output.push(
                <p key={i} className="pl-6" dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed) }} />
            );
        }
        else {
            output.push(
                <p key={i} dangerouslySetInnerHTML={{ __html: formatMarkdown(trimmed) }} />
            );
        }
    }

    return <>{output}</>;
};

const FormattedContent: React.FC<{ text: string; format: 'no-columns' | 'with-columns' }> = ({ text, format }) => {
  if (!text) return null;

  const hasComplexStructure = text.includes('**III. TỔ CHỨC HOẠT ĐỘNG**') || text.includes('**III. CÁCH TIẾN HÀNH**');

  if (!hasComplexStructure) {
     return (
        <div className="prose prose-slate max-w-none leading-relaxed">
           <ContentRenderer text={text} />
        </div>
    );
  }
  
  const sections = text.split(/\*\*III\. TỔ CHỨC HOẠT ĐỘNG\*\*|\*\*III\. CÁCH TIẾN HÀNH\*\*/);
  const preActivitiesContent = sections[0];
  const activitiesContent = sections[1] || '';
  const activityTitle = text.includes('**III. TỔ CHỨC HOẠT ĐỘNG**') ? '**III. TỔ CHỨC HOẠT ĐỘNG**' : '**III. CÁCH TIẾN HÀNH**';

  return (
    <div className="prose prose-slate max-w-none leading-relaxed">
      <ContentRenderer text={preActivitiesContent} />
      
      <p><strong dangerouslySetInnerHTML={{ __html: formatMarkdown(activityTitle) }} /></p>
      
      {format === 'with-columns' && activitiesContent ? (
        <table className="w-full border-collapse border border-slate-400 mt-4">
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
                                <td colSpan={2} className="border border-slate-300 px-4 py-2">
                                  <ContentRenderer text={row.title} />
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td className="border border-slate-300 px-4 py-2 align-top">
                               <ContentRenderer text={row.teacherActions.join('\n')} />
                            </td>
                            <td className="border border-slate-300 px-4 py-2 align-top">
                                <ContentRenderer text={row.childActions.join('\n')} />
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
            </tbody>
        </table>
      ) : (
        <ContentRenderer text={activitiesContent} />
      )}
    </div>
  );
};

const formatBlockToHtml = (text: string): string => {
    if (!text) return '';
    
    const lines = text.split('\n');
    let html = '';
    let inNumberedList = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            html += '<br>';
            continue;
        }

        const content = formatMarkdown(trimmed);
        
        if (trimmed.match(/^(I{1,3}|IV|V|VI|VII|VIII|IX|X)\./)) {
            inNumberedList = false;
            html += `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5;"><strong>${content}</strong></p>`;
        } else if (trimmed.match(/^\d+\./) || trimmed.match(/^\*\*\d+\./)) {
            inNumberedList = true;
            html += `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5;"><strong>${content}</strong></p>`;
        } else if (trimmed.startsWith('-')) {
            inNumberedList = false;
            html += `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5; padding-left: 20px; text-indent: -20px;">- ${formatMarkdown(trimmed.substring(1).trim())}</p>`;
        } else if (inNumberedList) {
            html += `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5; padding-left: 20px;">${content}</p>`;
        } else {
            html += `<p style="margin-bottom: 0.5em; font-size: 14pt; line-height: 1.5;">${content}</p>`;
        }
    }
    return html;
};


const formatTextForDoc = (text: string, format: 'no-columns' | 'with-columns'): string => {
    if (!text) return '';
    
    const hasComplexStructure = text.includes('**III. TỔ CHỨC HOẠT ĐỘNG**') || text.includes('**III. CÁCH TIẾN HÀNH**');

    if (!hasComplexStructure || format === 'no-columns') {
        return formatBlockToHtml(text);
    }
    
    const sections = text.split(/\*\*III\. TỔ CHỨC HOẠT ĐỘNG\*\*|\*\*III\. CÁCH TIẾN HÀNH\*\*/);
    const preActivitiesContent = sections[0];
    const activitiesContent = sections[1] || '';
    const activityTitle = text.includes('**III. TỔ CHỨC HOẠT ĐỘNG**') ? '**III. TỔ CHỨC HOẠT ĐỘNG**' : '**III. CÁCH TIẾN HÀNH**';

    let htmlContent = formatBlockToHtml(preActivitiesContent);
    htmlContent += formatBlockToHtml(activityTitle);

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
                tableHtml += `<tr style="background-color: #f9f9f9;"><td colspan="2" style="border: 1px solid #ccc; padding: 8px;">${formatBlockToHtml(row.title)}</td></tr>`;
            }
            tableHtml += `<tr>
                <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">${formatBlockToHtml(row.teacherActions.join('\n'))}</td>
                <td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;">${formatBlockToHtml(row.childActions.join('\n'))}</td>
            </tr>`;
        });

        tableHtml += `</tbody></table>`;
        htmlContent += tableHtml;
    } else {
        htmlContent += formatBlockToHtml(activitiesContent);
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
      <div className="h-48 overflow-y-auto space-y-4 pr-2">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && <i className="fas fa-robot text-teal-500 text-lg mb-1"></i>}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.role === 'user'
                ? 'bg-cyan-500 text-white rounded-br-none'
                : 'bg-slate-200 text-slate-800 rounded-bl-none'
            }`}>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}></p>
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
  const [activeTab, setActiveTab] = useState<Tab>('learning');
  
  useEffect(() => {
    if (lessonPlanParts) {
      setCopyStatus('idle');
    }
  }, [lessonPlanParts]);

  const handleCopy = () => {
    if (!lessonPlanParts) return;
    
    let contentToCopy = '';
    switch (activeTab) {
      case 'learning':
        contentToCopy = lessonPlanParts.learningActivity;
        break;
      case 'outdoor':
        contentToCopy = lessonPlanParts.outdoorActivity;
        break;
      case 'corner':
        contentToCopy = lessonPlanParts.cornerActivity;
        break;
    }

    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };
  
  const handleDownload = () => {
    if (!lessonPlanParts) return;
    
    const learningHtml = formatTextForDoc(lessonPlanParts.learningActivity, format);
    const outdoorHtml = formatTextForDoc(lessonPlanParts.outdoorActivity, 'no-columns');
    const cornerHtml = formatTextForDoc(lessonPlanParts.cornerActivity, 'no-columns');

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
          p { margin: 0 0 0.5em 0; line-height: 1.5; font-size: 14pt; }
          h1, h2, h3 { page-break-after: avoid; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <h1 style="text-align: center;">KẾ HOẠCH TỔ CHỨC HOẠT ĐỘNG</h1>
        <br/>
        <h2><strong>I. HOẠT ĐỘNG HỌC</strong></h2>
        ${learningHtml}
        <h2 class="page-break"><strong>II. HOẠT ĐỘNG NGOÀI TRỜI</strong></h2>
        ${outdoorHtml}
        <h2 class="page-break"><strong>III. HOẠT ĐỘNG GÓC</strong></h2>
        ${cornerHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
    });
    
    let fileName = 'GiaoAn_TongHop.doc';
    const subjectMatch = lessonPlanParts.learningActivity.match(/Đề tài\s*:\s*(.*)/);
    if (subjectMatch && subjectMatch[1]) {
        const subject = subjectMatch[1].trim().replace(/\*\*/g, '').replace(/[\/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_');
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

  const renderContent = () => {
    if (!lessonPlanParts) return null;
    switch(activeTab) {
      case 'learning':
        return <FormattedContent text={lessonPlanParts.learningActivity} format={format} />;
      case 'outdoor':
        return <FormattedContent text={lessonPlanParts.outdoorActivity} format="no-columns" />;
      case 'corner':
        return <FormattedContent text={lessonPlanParts.cornerActivity} format="no-columns" />;
      default:
        return null;
    }
  }
  
  const Placeholder = () => (
    <div className="p-8 h-full flex flex-col justify-center items-center text-center text-slate-500">
      <div className="text-6xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
          <i className="fas fa-book-open-reader"></i>
      </div>
      <h3 className="text-2xl font-semibold text-slate-700">Giáo án của bạn sẽ xuất hiện ở đây</h3>
      <p className="mt-2 max-w-md">Điền thông tin và nhấn "Tạo giáo án với AI" để bắt đầu sáng tạo.</p>
    </div>
  );

  const TabButton: React.FC<{tab: Tab, label: string, icon: string}> = ({tab, label, icon}) => (
     <button
        onClick={() => setActiveTab(tab)}
        className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all ${
          activeTab === tab 
          ? 'border-teal-500 text-teal-600 bg-white'
          : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
      >
        <i className={`fas ${icon}`}></i>
        <span>{label}</span>
      </button>
  );

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg h-full flex flex-col">
      {/* Header with actions */}
      <div className="flex justify-between items-center p-4 pl-6 border-b border-slate-200/80">
        <h2 className="text-xl font-bold text-slate-800">Kế hoạch Giảng dạy</h2>
        <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!lessonPlanParts}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <i className={`fas ${copyStatus === 'copied' ? 'fa-check' : 'fa-copy'}`}></i>
              <span>{copyStatus === 'copied' ? 'Đã chép!' : 'Sao chép'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={!lessonPlanParts}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white disabled:bg-teal-200 disabled:cursor-not-allowed"
            >
              <i className="fas fa-file-word"></i>
              <span>Tải về (.doc)</span>
            </button>
        </div>
      </div>
      
       {/* Tabs */}
      <div className="px-6 border-b border-slate-200/80 bg-slate-50/30">
        <div className="flex items-center -mb-px">
            <TabButton tab="learning" label="Hoạt động học" icon="fa-chalkboard-teacher" />
            <TabButton tab="outdoor" label="Hoạt động ngoài trời" icon="fa-sun" />
            <TabButton tab="corner" label="Hoạt động góc" icon="fa-cubes" />
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-grow">
        {lessonPlanParts ? (
          <div className="p-6 sm:p-8">
            {renderContent()}
          </div>
        ) : (
          <Placeholder />
        )}
      </div>

      {/* Chat Interface */}
      {lessonPlanParts && (
       <ChatInterface history={chatHistory} onSendMessage={onSendMessage} isLoading={isChatLoading} />
      )}
    </div>
  );
};
