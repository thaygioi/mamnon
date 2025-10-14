import { GoogleGenAI, Type } from "@google/genai";
import { LESSON_PLAN_EXAMPLES } from "../constants";
import type { LessonPlanRequest, LessonPlanParts, ChatMessage, RefineResponse } from "../types";

const formatDate = (dateString: string): string => {
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

const buildGenerationPrompt = (request: LessonPlanRequest): string => {
  return `
    Bạn là một chuyên gia soạn giáo án mầm non tại Việt Nam, am hiểu sâu sắc về Chương trình Giáo dục Mầm non ban hành bởi Bộ Giáo dục và Đào tạo. Dựa vào các thông tin sau đây, hãy tạo một giáo án chi tiết và sáng tạo, tuân thủ các định hướng cốt lõi của năm học 2024-2025.

    **Định hướng chuyên môn cần tuân thủ:**
    - **Lấy trẻ làm trung tâm:** Các hoạt động phải xuất phát từ hứng thú, nhu cầu và khả năng của trẻ.
    - **Học thông qua chơi và trải nghiệm:** Ưu tiên các hoạt động thực hành, khám phá để trẻ tự mình tìm tòi, học hỏi.
    - **Lồng ghép kỹ năng:** Tích hợp một cách tự nhiên các nội dung giáo dục về an toàn giao thông, bảo vệ môi trường, và kỹ năng sống cần thiết.
    - **Phát triển thể chất & Dinh dưỡng:** Chú trọng các hoạt động vận động và cung cấp kiến thức dinh dưỡng phù hợp.

    **Thông tin yêu cầu cụ thể:**
    - **Lĩnh vực**: ${request.activityType}
    - **Độ tuổi**: ${request.ageGroup}
    - **Chủ đề**: ${request.topic}
    - **Đề tài**: ${request.subject}
    - **Thời gian dự kiến**: ${request.duration}
    - **Người soạn**: ${request.teacherName}
    - **Đơn vị**: ${request.schoolName}
    - **Ngày soạn**: ${formatDate(request.preparationDate)}
    - **Ngày dạy**: ${formatDate(request.teachingDate)}

    **Yêu cầu về cấu trúc đầu ra:**
    Bạn PHẢI trả lời bằng một đối tượng JSON duy nhất, không có bất kỳ văn bản nào khác trước hoặc sau nó.
    Đối tượng JSON phải có 1 thuộc tính sau:
    1.  \`lessonPlanContent\`: Nội dung chi tiết cho toàn bộ giáo án. Cấu trúc của giáo án phải bao gồm các phần chính: I. MỤC TIÊU (Kiến thức, Kỹ năng, Thái độ), II. CHUẨN BỊ, và III. TỔ CHỨC HOẠT ĐỘNG. Trong đó, phần TỔ CHỨC HOẠT ĐỘNG phải được chia thành các hoạt động nhỏ, tuần tự như "Hoạt động 1: [Tên hoạt động]", "Hoạt động 2: [Tên hoạt động]",... Mỗi hoạt động cần mô tả rõ hoạt động của cô và hoạt động của trẻ.
    
    **QUAN TRỌNG:** Toàn bộ văn bản trong thuộc tính \`lessonPlanContent\` phải là dạng văn bản thuần túy (plain text), không chứa bất kỳ ký tự định dạng Markdown nào như dấu sao (*) hoặc dấu thăng (#). Giữ cấu trúc rõ ràng bằng cách xuống dòng và sử dụng các đề mục như "I. MỤC TIÊU", "1. Kiến thức:".
  `;
};

const lessonPlanPartsSchema = {
    type: Type.OBJECT,
    properties: {
        lessonPlanContent: { type: Type.STRING, description: "Nội dung chi tiết cho toàn bộ giáo án, được chia thành các hoạt động tuần tự (Hoạt động 1, 2, 3...)." },
    },
    required: ["lessonPlanContent"],
};

export const generateLessonPlan = async (
  request: LessonPlanRequest,
  apiKey: string,
): Promise<LessonPlanParts> => {
  if (!apiKey) {
    throw new Error("API Key không được cung cấp.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildGenerationPrompt(request);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: lessonPlanPartsSchema,
            temperature: 0.7,
            topP: 0.9,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as LessonPlanParts;

  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw new Error("Không thể tạo giáo án. Vui lòng kiểm tra lại API Key hoặc thử lại sau.");
  }
};


const buildRefinePrompt = (
  currentPlan: LessonPlanParts,
  history: ChatMessage[],
  newMessage: string
): string => {
  const formattedHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  return `
    Bạn là một trợ lý AI chuyên chỉnh sửa giáo án mầm non.
    Người dùng muốn chỉnh sửa một giáo án hiện có.

    **Giáo án hiện tại:**
    \`\`\`json
    ${JSON.stringify(currentPlan, null, 2)}
    \`\`\`

    **Lịch sử trò chuyện (nếu có):**
    ${formattedHistory}

    **Yêu cầu mới nhất từ người dùng:**
    user: ${newMessage}

    **Nhiệm vụ của bạn:**
    1.  Đọc và hiểu yêu cầu mới nhất của người dùng trong bối cảnh giáo án hiện tại và lịch sử trò chuyện.
    2.  Tạo ra một phiên bản **mới** của toàn bộ giáo án (trong thuộc tính \`lessonPlanContent\`) dựa trên yêu cầu chỉnh sửa.
    3.  Viết một câu trả lời ngắn gọn, thân thiện cho người dùng, xác nhận rằng bạn đã thực hiện thay đổi.

    **Yêu cầu về cấu trúc đầu ra:**
    Bạn PHẢI trả lời bằng một đối tượng JSON duy nhất, không có bất kỳ văn bản nào khác trước hoặc sau nó.
    Đối tượng JSON phải có 2 thuộc tính:
    1.  \`lessonPlan\`: Một đối tượng chứa thuộc tính \`lessonPlanContent\` của giáo án đã được cập nhật. Toàn bộ nội dung trong thuộc tính này phải là văn bản thuần túy (plain text), không chứa ký tự định dạng Markdown.
    2.  \`chatResponse\`: Một chuỗi (string) chứa câu trả lời của bạn cho người dùng.

    Bây giờ, hãy xử lý yêu cầu và trả về đối tượng JSON theo đúng định dạng.
  `;
};

const refineResponseSchema = {
    type: Type.OBJECT,
    properties: {
        lessonPlan: lessonPlanPartsSchema,
        chatResponse: { type: Type.STRING, description: "Câu trả lời dạng trò chuyện cho người dùng." }
    },
    required: ["lessonPlan", "chatResponse"],
};

export const refineLessonPlan = async (
  currentPlan: LessonPlanParts,
  history: ChatMessage[],
  newMessage: string,
  apiKey: string,
): Promise<RefineResponse> => {
  if (!apiKey) {
    throw new Error("API Key không được cung cấp.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildRefinePrompt(currentPlan, history, newMessage);

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: refineResponseSchema,
            temperature: 0.6,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as RefineResponse;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API để chỉnh sửa:", error);
    throw new Error("Không thể chỉnh sửa giáo án. Vui lòng kiểm tra lại API Key hoặc thử lại sau.");
  }
};