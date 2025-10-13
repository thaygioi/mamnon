import React, { useState } from 'react';
import { ACTIVITY_TYPES, AGE_GROUPS } from '../constants';
import { LessonPlanRequest } from '../types';

interface LessonPlanFormProps {
  onSubmit: (request: LessonPlanRequest) => void;
  isLoading: boolean;
}

export const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ onSubmit, isLoading }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Core Info
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0]);
  const [ageGroup, setAgeGroup] = useState(AGE_GROUPS[2]);
  const [topic, setTopic] = useState(''); // Chủ đề
  const [subject, setSubject] = useState(''); // Đề tài

  // Detailed Info
  const [duration, setDuration] = useState('30 - 35 phút');
  const [teacherName, setTeacherName] = useState('Nguyễn Thị Phương Thảo');
  const [schoolName, setSchoolName] = useState('Trường Mầm non Đề Thám');
  const [preparationDate, setPreparationDate] = useState(today);
  const [teachingDate, setTeachingDate] = useState(today);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !subject.trim()) {
      alert("Vui lòng nhập Chủ đề và Đề tài.");
      return;
    }
    onSubmit({ 
      activityType, 
      ageGroup, 
      topic,
      subject,
      duration,
      teacherName,
      schoolName,
      preparationDate,
      teachingDate
    });
  };

  const InputField = ({ id, label, value, onChange, placeholder, required = false, icon }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        <i className={`fas ${icon} mr-2 text-slate-400`}></i>{label}
      </label>
      <input
        type="text" id={id} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
      />
    </div>
  );

   const DateField = ({ id, label, value, onChange, icon }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
        <i className={`fas ${icon} mr-2 text-slate-400`}></i>{label}
      </label>
      <input
        type="date" id={id} value={value} onChange={onChange}
        className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
      />
    </div>
  );


  return (
    <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 p-6 sm:p-8 rounded-2xl shadow-lg h-full transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Thông tin Giáo án</h2>
        <p className="text-sm text-slate-500 mt-1">Cung cấp thông tin để AI bắt đầu sáng tạo.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Basic Info --- */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin cơ bản</legend>
          <div>
            <label htmlFor="activityType" className="block text-sm font-medium text-slate-700 mb-1">
              <i className="fas fa-puzzle-piece mr-2 text-teal-500"></i>Lĩnh vực
            </label>
            <select id="activityType" value={activityType} onChange={(e) => setActivityType(e.target.value)}
              className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
              {ACTIVITY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-slate-700 mb-1">
              <i className="fas fa-child mr-2 text-cyan-500"></i>Độ tuổi
            </label>
            <select id="ageGroup" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}
              className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
              {AGE_GROUPS.map((age) => <option key={age} value={age}>{age}</option>)}
            </select>
          </div>
          <InputField id="topic" label="Chủ đề" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ví dụ: Ngành nghề" required icon="fa-tags" />
          <InputField id="subject" label="Đề tài" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ví dụ: Bật liên tục qua các vòng" required icon="fa-lightbulb" />
        </fieldset>

        {/* --- Detailed Info --- */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin chi tiết</legend>
          <InputField id="duration" label="Thời gian" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ví dụ: 30-35 phút" required icon="fa-clock" />
          <InputField id="teacherName" label="Người dạy" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Ví dụ: Nguyễn Thị A" required icon="fa-user" />
          <InputField id="schoolName" label="Đơn vị" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Ví dụ: Trường Mầm non Họa Mi" required icon="fa-school" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <DateField id="preparationDate" label="Ngày soạn" value={preparationDate} onChange={e => setPreparationDate(e.target.value)} icon="fa-calendar-pen" />
             <DateField id="teachingDate" label="Ngày dạy" value={teachingDate} onChange={e => setTeachingDate(e.target.value)} icon="fa-calendar-day" />
          </div>
        </fieldset>
        
        <div>
          <button type="submit" disabled={isLoading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300">
            <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'} mr-2`}></i>
            {isLoading ? 'Đang tạo...' : 'Tạo giáo án với AI'}
          </button>
        </div>
      </form>
    </div>
  );
};