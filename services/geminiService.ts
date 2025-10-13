import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanRequest, LessonPlanParts, ChatMessage, RefineResponse } from '../types';
import { LESSON_PLAN_EXAMPLES } from '../constants';

// The API key must be obtained exclusively from the environment variable for Vercel/Vite.
// FIX: Updated to use process.env.API_KEY as per the coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateLessonPlan = async (request: LessonPlanRequest): Promise<LessonPlanParts> => {
  const example = LESSON_PLAN_EXAMPLES[0];
  const exampleResponse = JSON.parse(example.response);

  const prompt = `Bạn là một chuyên gia soạn giáo án mầm non toàn diện và chi tiết. Nhiệm vụ của bạn là tạo ra một kế hoạch hoạt động cho cả ngày học, bao gồm 3 phần chính có liên kết logic với nhau: Hoạt động học, Hoạt động ngoài trời, và Hoạt động góc.

**QUY TRÌNH THỰC HIỆN:**
1.  **Sử dụng thông tin chi tiết**: Lấy tất cả các thông tin được cung cấp (Lĩnh vực, Lứa tuổi, Chủ đề, Đề tài, Thời gian, Ngày tháng, Người dạy, Đơn vị) để tạo phần mở đầu chuẩn cho giáo án.
2.  **Tạo Hoạt động học**:
    *   Dựa trên phần thông tin chi tiết, soạn một giáo án hoàn chỉnh cho Hoạt động học.
    *   Phần đầu của giáo án phải được trình bày chính xác như trong ví dụ mẫu.
    *   Nội dung chính của hoạt động học (Mục tiêu, Chuẩn bị, Tổ chức hoạt động) phải được sáng tạo dựa trên **Chủ đề** và **Đề tài**.
3.  **Tạo Hoạt động ngoài trời**: Lên ý tưởng cho các hoạt động và trò chơi ngoài trời có liên quan đến **Đề tài** chính để củng cố kiến thức.
4.  **Tạo Hoạt động góc**: Đề xuất các hoạt động cụ thể cho từng góc (Xây dựng, Nghệ thuật, Khoa học, Sách...) nhằm mở rộng và để trẻ tự do khám phá **Chủ đề**.
5.  **Trả về kết quả**: Toàn bộ nội dung phải được trả về dưới dạng một đối tượng JSON duy nhất, không có văn bản nào khác bên ngoài.

---
**VÍ DỤ MẪU**

**Yêu cầu đầu vào:**
- Lĩnh vực phát triển: ${example.request.activityType}
- Lứa tuổi: ${example.request.ageGroup}
- Chủ đề: ${example.request.topic}
- Đề tài: ${example.request.subject}
- Thời gian: ${example.request.duration}
- Ngày soạn: ${example.request.preparationDate}
- Ngày dạy: ${example.request.teachingDate}
- Người dạy: ${example.request.teacherName}
- Đơn vị: ${example.request.schoolName}


**JSON đầu ra mong muốn:**
\`\`\`json
${JSON.stringify(exampleResponse, null, 2)}
\`\`\`
---

**YÊU CẦU CẦN THỰC HIỆN**

Bây giờ, hãy tạo một kế hoạch giáo án mới với các thông tin sau:
- Lĩnh vực phát triển: ${request.activityType}
- Lứa tuổi: ${request.ageGroup}
- Chủ đề: ${request.topic}
- Đề tài: ${request.subject}
- Thời gian: ${request.duration}
- Ngày soạn: ${request.preparationDate}
- Ngày dạy: ${request.teachingDate}
- Người dạy: ${request.teacherName}
- Đơn vị: ${request.schoolName}

Hãy đảm bảo bạn trả về một đối tượng JSON hợp lệ, không có bất kỳ văn bản nào khác bên ngoài đối tượng JSON.`;

  try {
     const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            learningActivity: { type: Type.STRING },
            outdoorActivity: { type: Type.STRING },
            cornerActivity: { type: Type.STRING },
          },
          required: ["learningActivity", "outdoorActivity", "cornerActivity"],
        },
      },
    });

    return JSON.parse(response.text) as LessonPlanParts;

  } catch (error) {
    console.error("Error generating lesson plan:", error);
    if (error instanceof SyntaxError) {
       throw new Error("AI đã trả về dữ liệu không hợp lệ. Vui lòng thử lại.");
    }
    throw new Error("Không thể tạo giáo án. Vui lòng thử lại sau.");
  }
};


export const refineLessonPlan = async (
  currentPlan: LessonPlanParts,
  history: ChatMessage[],
  newMessage: string
): Promise<RefineResponse> => {
  
  const historyString = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `Bạn là một trợ lý AI hữu ích chuyên giúp giáo viên mầm non tinh chỉnh giáo án.
Nhiệm vụ của bạn là nhận một giáo án hiện có, lịch sử trò chuyện và một yêu cầu mới từ người dùng, sau đó cập nhật giáo án dựa trên yêu cầu đó.

**QUY TRÌNH:**
1.  **Phân tích yêu cầu**: Đọc kỹ yêu cầu mới của người dùng trong ngữ cảnh của cuộc trò chuyện và giáo án hiện tại.
2.  **Cập nhật giáo án**: Sửa đổi nội dung của giáo án (cả 3 phần nếu cần) để đáp ứng yêu cầu. Giữ nguyên cấu trúc và định dạng của giáo án.
3.  **Tạo phản hồi chat**: Viết một câu trả lời ngắn gọn, thân thiện để xác nhận rằng bạn đã thực hiện thay đổi. Ví dụ: "Được thôi, tôi đã đơn giản hóa hoạt động ngoài trời cho bạn rồi."
4.  **Trả về kết quả**: Trả về một đối tượng JSON duy nhất chứa hai khóa: "lessonPlan" (đối tượng giáo án đã cập nhật) và "chatResponse" (chuỗi phản hồi chat của bạn).

---
**GIÁO ÁN HIỆN TẠI:**
\`\`\`json
${JSON.stringify(currentPlan, null, 2)}
\`\`\`

---
**LỊCH SỬ TRÒ CHUYỆN:**
${historyString}
user: ${newMessage}

---
**YÊU CẦU MỚI TỪ NGƯỜI DÙNG:**
"${newMessage}"

---
Bây giờ, hãy cập nhật giáo án và tạo phản hồi. Trả về một đối tượng JSON hợp lệ theo định dạng đã chỉ định.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lessonPlan: {
              type: Type.OBJECT,
              properties: {
                learningActivity: { type: Type.STRING },
                outdoorActivity: { type: Type.STRING },
                cornerActivity: { type: Type.STRING },
              },
               required: ["learningActivity", "outdoorActivity", "cornerActivity"],
            },
            chatResponse: { type: Type.STRING }
          },
          required: ["lessonPlan", "chatResponse"],
        },
      },
    });
    
    return JSON.parse(response.text) as RefineResponse;

  } catch (error) {
    console.error("Error refining lesson plan:", error);
    if (error instanceof SyntaxError) {
      throw new Error("AI đã trả về dữ liệu không hợp lệ. Vui lòng thử lại.");
    }
    throw new Error("Không thể chỉnh sửa giáo án. Vui lòng thử lại sau.");
  }
};