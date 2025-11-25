import React, { useState, useEffect } from 'react';
import { LessonPlanForm } from './components/LessonPlanForm';
import { LessonPlanDisplay } from './components/LessonPlanDisplay';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { ApiKeyModal } from './components/ApiKeyModal';
import Login from './components/Login';

import {
  LessonPlanRequest,
  LessonPlanParts,
  ChatMessage,
  SavedLessonPlan
} from './types';

import {
  generateLearningActivity,
  generateOutdoorActivity,
  generateCornerActivity,
  refineLessonPlan
} from './services/geminiService';


// ============================
// DANH MỤC GIÁO ÁN ĐÃ LƯU
// ============================
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
            <li
              key={plan.id}
              className={`p-3 rounded-lg transition-all ${
                currentPlanId === plan.id
                  ? 'bg-teal-100 border border-teal-200'
                  : 'bg-slate-50 border'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-700">
                    {plan.request.subject}
                  </p>
                  <p className="text-xs text-slate-500">
                    {plan.request.topic}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onLoad(plan)}
                    title="Tải giáo án"
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 hover:bg-sky-500 hover:text-white text-slate-600 transition"
                  >
                    <i className="fas fa-upload"></i>
                  </button>
                  <button
                    onClick={() => onDelete(plan.id)}
                    title="Xoá giáo án"
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-200 hover:bg-red-500 hover:text-white text-slate-600 transition"
                  >
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


// ============================
// APP CHÍNH
// ============================
const App: React.FC = () => {

  // ⭐ STATE LOGIN
  const [loggedIn, setLoggedIn] = useState<boolean>(
    localStorage.getItem("loggedIn") === "yes"
  );

  // ⭐ Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setLoggedIn(false);
  };


  // ===========================
  // STATE CHÍNH CỦA ỨNG DỤNG
  // ===========================
  const [lessonPlan, setLessonPlan] = useState<LessonPlanParts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const [savedPlans, setSavedPlans] = useState<SavedLessonPlan[]>([]);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [currentRequest, setCurrentRequest] = useState<LessonPlanRequest | null>(null);

  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);


  // ⭐ USE EFFECT — load dữ liệu
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('geminiApiKey');
      if (storedKey) setApiKey(storedKey);
      else setIsApiKeyModalOpen(true);

      const storedPlans = localStorage.getItem('lessonPlans');
      if (storedPlans) setSavedPlans(JSON.parse(storedPlans));

    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);


  // ⭐⭐ 🔥 DI CHUYỂN LOGIN XUỐNG ĐÂY SAU CÁC STATE + EFFECT 🔥 ⭐⭐
  if (!loggedIn) {
    return <Login onLoginSuccess={() => setLoggedIn(true)} />;
  }


  // ===========================
  // HÀM XỬ LÝ
  // ===========================
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      localStorage.setItem('geminiApiKey', key);
    } catch(e) {
      console.error("Failed to save API key", e);
      setError("Không thể lưu API Key vào trình duyệt.");
    }
    setIsApiKeyModalOpen(false);
  };

  const updateStoredPlans = (plans: SavedLessonPlan[]) => {
    try {
      localStorage.setItem('lessonPlans', JSON.stringify(plans));
    } catch(e) {
      console.error("Failed to save plans", e);
    }
  };


  const handleGenerateLessonPlan = async (request: LessonPlanRequest) => {

    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      setError("Vui lòng nhập API Key để tiếp tục.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLessonPlan(null);
    setChatHistory([]);
    setCurrentRequest(request);

    try {
      const learningActivity = await generateLearningActivity(request, apiKey);

      const initialParts: LessonPlanParts = {
        learningActivity,
        outdoorActivity: 'AI đang soạn thảo hoạt động này...',
        cornerActivity: 'AI đang soạn thảo hoạt động này...',
      };

      setLessonPlan(initialParts);

      const [outdoorActivity, cornerActivity] = await Promise.all([
        generateOutdoorActivity(request, learningActivity, apiKey),
        generateCornerActivity(request, learningActivity, apiKey),
      ]);

      const finalParts: LessonPlanParts = {
        learningActivity,
        outdoorActivity,
        cornerActivity,
      };

      setLessonPlan(finalParts);

      const newPlan: SavedLessonPlan = {
        id: Date.now(),
        request,
        parts: finalParts,
      };

      const updatedPlans = [...savedPlans, newPlan];
      setSavedPlans(updatedPlans);
      updateStoredPlans(updatedPlans);
      setCurrentPlanId(newPlan.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi không xác định xảy ra.");
      setLessonPlan(null);
      setCurrentRequest(null);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      setError("Vui lòng nhập API Key để tiếp tục.");
      return;
    }
    if (!lessonPlan || currentPlanId === null) return;

    const newUserMsg: ChatMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setIsChatLoading(true);
    setError(null);

    try {
      const result = await refineLessonPlan(
        lessonPlan,
        updatedHistory,
        message,
        apiKey
      );

      const updatedPlans = savedPlans.map(p =>
        p.id === currentPlanId
          ? { ...p, parts: result.lessonPlan }
          : p
      );

      setSavedPlans(updatedPlans);
      updateStoredPlans(updatedPlans);

      setLessonPlan(result.lessonPlan);

      setChatHistory(prev => [
        ...prev,
        { role: 'model', content: result.chatResponse }
      ]);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi không xác định.");
    } finally {
      setIsChatLoading(false);
    }
  };


  const handleLoadPlan = (plan: SavedLessonPlan) => {
    setLessonPlan(plan.parts);
    setCurrentRequest(plan.request);
    setCurrentPlanId(plan.id);
    setChatHistory([]);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleDeletePlan = (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xoá giáo án này?")) return;

    const updatedPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(updatedPlans);
    updateStoredPlans(updatedPlans);

    if (id === currentPlanId) {
      setLessonPlan(null);
      setCurrentPlanId(null);
      setCurrentRequest(null);
      setChatHistory([]);
    }
  };


  // ===========================
  // Giao diện chính
  // ===========================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-100">

      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onLogout={handleLogout}
      />

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
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                <strong className="font-bold">Lỗi! </strong>
                <span>{error}</span>
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

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
        isInitialSetup={!apiKey}
      />
    </div>
  );
};


export default App;
