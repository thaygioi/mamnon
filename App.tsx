import React, { useState } from 'react';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanDisplay } from './components/LessonPlanDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { LessonPlanRequest, LessonPlanParts, ChatMessage } from './types';
import { generateLessonPlan, refineLessonPlan } from './services/geminiService';

const App: React.FC = () => {
  const [lessonPlan, setLessonPlan] = useState<LessonPlanParts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);


  const handleGenerateLessonPlan = async (request: LessonPlanRequest) => {
    setIsLoading(true);
    setError(null);
    setLessonPlan(null);
    setChatHistory([]); // Reset chat on new generation
    try {
      const result = await generateLessonPlan(request);
      setLessonPlan(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
      setLessonPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!lessonPlan) return;

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);
    setError(null);

    try {
      const result = await refineLessonPlan(lessonPlan, updatedHistory, message);
      setLessonPlan(result.lessonPlan);
      const modelResponse: ChatMessage = { role: 'model', content: result.chatResponse };
      setChatHistory(prev => [...prev, modelResponse]);
    } catch (err) {
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
      // Revert user message on error
      setChatHistory(chatHistory);
    } finally {
      setIsChatLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="relative lg:col-span-1">
             {isLoading && <LoadingSpinner />}
            <LessonPlanForm onSubmit={handleGenerateLessonPlan} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2 h-full">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4" role="alert">
                <strong className="font-bold">Lỗi! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <LessonPlanDisplay 
              lessonPlanParts={lessonPlan}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isChatLoading={isChatLoading}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;