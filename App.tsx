
import React, { useState, useEffect } from 'react';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanDisplay } from './components/LessonPlanDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
// import { ApiKeyModal } from './components/ApiKeyModal';
import { LessonPlanRequest, LessonPlanParts, ChatMessage, SavedLessonPlan } from './types';
// FIX: Update imports to use service functions without apiKey parameter.
import { generateLearningActivity, generateOutdoorActivity, generateCornerActivity, refineLessonPlan } from './services/geminiService';

const SavedPlans: React.FC<{
  plans: SavedLessonPlan[];
  onLoad: (plan: SavedLessonPlan) => void;
  onDelete: (id: number) => void;
  currentPlanId: number | null;
}> = ({ plans, onLoad, onDelete, currentPlanId }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 sm:p-8 rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Giáo án đã lưu</h3>
      {plans.length > 0 ? (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {[...plans].reverse().map(plan => (
            <li key={plan.id} className={`p-3 rounded-lg transition-all ${currentPlanId === plan.id ? 'bg-teal-100 border border-teal-200' : 'bg-slate-50 border'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-700">{plan.request.subject}</p>
                  <p className="text-xs text-slate-500">{plan.request.topic}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => onLoad(plan)} title="Tải giáo án" className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 hover:bg-sky-500 hover:text-white text-slate-600 transition">
                    <i className="fas fa-upload"></i>
                  </button>
                  <button onClick={() => onDelete(plan.id)} title="Xoá giáo án" className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 transition">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Chưa có giáo án nào được lưu.</p>
      )}
    </div>
  );
};


const App: React.FC = () => {
  const [lessonPlan, setLessonPlan] = useState<LessonPlanParts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const [savedPlans, setSavedPlans] = useState<SavedLessonPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [currentRequest, setCurrentRequest] = useState<LessonPlanRequest | null>(null);

  // FIX: Remove API key management from UI. API key must be handled by environment variables.
  // const [apiKey, setApiKey] = useState<string>('');
  // const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // FIX: Remove API key management from UI.
  // On initial load, only check for saved lesson plans.
  useEffect(() => {
    try {
        const storedPlans = localStorage.getItem('lessonPlans');
        if (storedPlans) {
            setSavedPlans(JSON.parse(storedPlans));
        }
    } catch (e) {
        console.error("Failed to load data from localStorage", e);
    }
  }, []);
  
  // FIX: Remove API key management from UI.
  // const handleSaveApiKey = (key: string) => {
  //   setApiKey(key);
  //   try {
  //     localStorage.setItem('geminiApiKey', key);
  //   } catch(e) {
  //     console.error("Failed to save API key to localStorage", e);
  //     setError("Không thể lưu API Key vào trình duyệt.");
  //   }
  //   setIsApiKeyModalOpen(false);
  // };

  const updateStoredPlans = (plans: SavedLessonPlan[]) => {
      try {
          localStorage.setItem('lessonPlans', JSON.stringify(plans));
      } catch(e) {
          console.error("Failed to save plans to localStorage", e);
      }
  };

  const handleGenerateLessonPlan = async (request: LessonPlanRequest) => {
    // FIX: Remove API key check. API key is handled by the environment.
    setIsLoading(true);
    setError(null);
    setLessonPlan(null);
    setChatHistory([]);
    setCurrentRequest(request); // Set request info early for the form

    try {
      // Step 1: Generate the main learning activity
      // FIX: Remove apiKey argument from service call.
      const learningActivity = await generateLearningActivity(request);
      
      // Show the first part immediately with placeholders for the rest
      const initialParts: LessonPlanParts = {
        learningActivity,
        outdoorActivity: 'AI đang soạn thảo hoạt động này...',
        cornerActivity: 'AI đang soạn thảo hoạt động này...',
      };
      setLessonPlan(initialParts);
      
      // Step 2: Generate supplementary activities in parallel using the main activity as context
      // FIX: Remove apiKey arguments from service calls.
      const [outdoorActivity, cornerActivity] = await Promise.all([
        generateOutdoorActivity(request, learningActivity),
        generateCornerActivity(request, learningActivity),
      ]);
      
      const finalParts: LessonPlanParts = {
        learningActivity,
        outdoorActivity,
        cornerActivity,
      };

      // Update the view with all parts and save the complete plan
      setLessonPlan(finalParts);

      const newPlan: SavedLessonPlan = {
          id: Date.now(),
          request: request,
          parts: finalParts,
      };
      
      const updatedPlans = [...savedPlans, newPlan];
      setSavedPlans(updatedPlans);
      updateStoredPlans(updatedPlans);
      setCurrentPlanId(newPlan.id);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
      setLessonPlan(null);
      setCurrentRequest(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    // FIX: Remove apiKey check.
    if (!lessonPlan || currentPlanId === null) return;

    const newUserMessage: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);
    setError(null);

    try {
      // FIX: Remove apiKey argument from service call.
      const result = await refineLessonPlan(lessonPlan, updatedHistory, message);

      const updatedPlans = savedPlans.map(p =>
          p.id === currentPlanId ? { ...p, parts: result.lessonPlan } : p
      );
      setSavedPlans(updatedPlans);
      updateStoredPlans(updatedPlans);
      
      setLessonPlan(result.lessonPlan);
      const modelResponse: ChatMessage = { role: 'model', content: result.chatResponse };
      setChatHistory(prev => [...prev, modelResponse]);
    } catch (err) {
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi không xác định xảy ra.");
      }
      setChatHistory(chatHistory);
    } finally {
      setIsChatLoading(false);
    }
  }

  const handleLoadPlan = (plan: SavedLessonPlan) => {
      setLessonPlan(plan.parts);
      setCurrentRequest(plan.request);
      setCurrentPlanId(plan.id);
      setChatHistory([]);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeletePlan = (id: number) => {
      if (window.confirm("Bạn có chắc chắn muốn xoá giáo án này không?")) {
          const updatedPlans = savedPlans.filter(p => p.id !== id);
          setSavedPlans(updatedPlans);
          updateStoredPlans(updatedPlans);
          
          if (id === currentPlanId) {
              setLessonPlan(null);
              setCurrentPlanId(null);
              setCurrentRequest(null);
              setChatHistory([]);
          }
      }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100">
      {/* FIX: Remove prop for opening API key modal. */}
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-1 space-y-8">
            <div className="relative">
              {isLoading && <LoadingSpinner />}
              <LessonPlanForm 
                onSubmit={handleGenerateLessonPlan} 
                isLoading={isLoading}
                initialData={currentRequest}
              />
            </div>
             {savedPlans.length > 0 && (
              <SavedPlans 
                  plans={savedPlans} 
                  onLoad={handleLoadPlan} 
                  onDelete={handleDeletePlan}
                  currentPlanId={currentPlanId}
              />
            )}
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
              format={currentRequest?.format || 'no-columns'}
            />
          </div>
        </div>
      </main>
      <Footer />
      {/* FIX: Remove API key modal from UI. */}
      {/* <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
        isInitialSetup={!apiKey}
      /> */}
    </div>
  );
};

export default App;
