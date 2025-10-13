export interface LessonPlanRequest {
  activityType: string;
  ageGroup: string;
  topic: string; // Chủ đề
  subject: string; // Đề tài
  duration: string;
  preparationDate: string;
  teachingDate: string;
  teacherName: string;
  schoolName: string;
}

export interface LessonPlanParts {
  learningActivity: string;
  outdoorActivity: string;
  cornerActivity: string;
}

// NEW: For chat functionality
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface RefineResponse {
  lessonPlan: LessonPlanParts;
  chatResponse: string;
}

export interface SavedLessonPlan {
  id: number; // Using timestamp for simplicity
  request: LessonPlanRequest;
  parts: LessonPlanParts;
}
