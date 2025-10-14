import React, { useState, useEffect } from 'react';
import { ACTIVITY_TYPES, AGE_GROUPS } from '../constants';
import { LessonPlanRequest } from '../types';

interface LessonPlanFormProps {
  onSubmit: (request: LessonPlanRequest) => void;
  isLoading: boolean;
  initialData?: LessonPlanRequest | null;
}

// --- Sub-components with explicit props for type safety ---

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange, placeholder, required = false, icon }) => (
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

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: string;
}

const DateField: React.FC<DateFieldProps> = ({ id, label, value, onChange, icon }) => (
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

const getDurationForAgeGroup = (ageGroup: string): string => {
  switch (ageGroup) {
    case 'Trẻ 3-6 tháng':
    case 'Trẻ 6-12 tháng':
      return '5-10 phút';
    case 'Trẻ 12-18 tháng':
    case 'Trẻ 18-24 tháng':
      return '10-15 phút';
    case 'Trẻ 24-36 tháng':
      return '15-20 phút';
    case 'Trẻ 3-4 tuổi':
      return '20-25 phút';
    case 'Trẻ 4-6 tuổi':
      return '30-35 phút';
    case 'Trẻ 4-5 tuổi':
    case 'Trẻ 5-6 tuổi':
      return '30-35 phút';
    default:
      return '25-30 phút'; // Default fallback
  }
};


export const LessonPlanForm: React.FC<LessonPlanFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultAgeGroup = AGE_GROUPS[6]; // 'Trẻ 4-5 tuổi'
  
  // Core Info
  const [activityType, setActivityType] = useState(ACTIVITY_TYPES[0]);
  const [ageGroup, setAgeGroup] = useState(defaultAgeGroup);
  const [topic, setTopic] = useState(''); // Chủ đề
  const [subject, setSubject] = useState(''); // Đề tài
  const [format, setFormat] = useState<'no-columns' | 'with-columns'>('no-columns');

  // Detailed Info
  const [duration, setDuration] = useState(getDurationForAgeGroup(defaultAgeGroup));
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [preparationDate, setPreparationDate] = useState(today);
  const [teachingDate, setTeachingDate] = useState(today);

  useEffect(() => {
    setDuration(getDurationForAgeGroup(ageGroup));
  }, [ageGroup]);

  useEffect(() => {
    if (initialData) {
        setActivityType(initialData.activityType);
        setAgeGroup(initialData.ageGroup);
        setTopic(initialData.topic);
        setSubject(initialData.subject);
        // Duration is now derived from ageGroup, so we don't set it from initialData
        setTeacherName(initialData.teacherName);
        setSchoolName(initialData.schoolName);
        setPreparationDate(initialData.preparationDate);
        setTeachingDate(initialData.teachingDate);
        if (initialData.format) {
          setFormat(initialData.format);
        }
    }
  }, [initialData]);

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
      teachingDate,
      format
    });
  };

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
            <select id="activityType" value={activityType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActivityType(e.target.value)}
              className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition">
              {ACTIVITY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ageGroup" className="block text-sm font-medium text-slate-700 mb-1">
              <i className="fas fa-child mr-2 text-cyan-500"></i>Độ tuổi
            </label>
            <select id="ageGroup" value={ageGroup} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAgeGroup(e.target.value)}
              className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
              {AGE_GROUPS.map((age) => <option key={age} value={age}>{age}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-slate-700 mb-1">
              <i className="fas fa-columns mr-2 text-sky-500"></i>Định dạng
            </label>
            <select id="format" value={format} onChange={(e) => setFormat(e.target.value as 'no-columns' | 'with-columns')}
              className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition">
              <option value="no-columns">Văn bản liền mạch</option>
              <option value="with-columns">Chia cột (Cô - Trẻ)</option>
            </select>
          </div>
          <InputField id="topic" label="Chủ đề" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Ví dụ: Ngành nghề" required icon="fa-tags" />
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
              <i className="fas fa-lightbulb mr-2 text-slate-400"></i>Đề tài
            </label>
            <textarea
              id="subject"
              rows={4}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ví dụ: Hát: “Em đi qua ngã tư đường phố” - Nghe hát: Trống cơm"
              required
              className="block w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
        </fieldset>

        {/* --- Detailed Info --- */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thông tin chi tiết</legend>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">
                <i className="fas fa-clock mr-2 text-slate-400"></i>Thời gian
            </label>
            <input
                type="text"
                id="duration"
                value={duration}
                disabled
                className="block w-full px-3 py-2 bg-slate-100/80 border border-slate-300 rounded-md shadow-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition cursor-not-allowed"
            />
          </div>

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