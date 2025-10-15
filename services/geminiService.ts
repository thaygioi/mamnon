
import { GoogleGenAI, Type } from "@google/genai";
import type { LessonPlanRequest, LessonPlanParts, ChatMessage, RefineResponse } from "../types";

const formatDate = (dateString: string): string => {
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

// --- PROMPT BUILDERS FOR SEQUENTIAL GENERATION ---

const buildLearningActivityPrompt = (request: LessonPlanRequest): string => {
    const commonDirectives = `Bạn là một chuyên gia soạn giáo án mầm non tại Việt Nam, am hiểu sâu sắc về Chương trình Giáo dục Mầm non ban hành bởi Bộ Giáo dục và Đào tạo.

**Nhiệm vụ:**
Soạn một giáo án **chi tiết, đầy đủ và đúng chuyên môn** cho **Ho hoạt động học** chính, tuân thủ các định hướng cốt lõi của năm học 2024-2025.

**Định hướng chuyên môn cần tuân thủ:**
- **Lấy trẻ làm trung tâm:** Các hoạt động phải xuất phát từ hứng thú, nhu cầu và khả năng của trẻ.
- **Học thông qua chơi và trải nghiệm:** Ưu tiên các hoạt động thực hành, khám phá để trẻ tự mình tìm tòi, học hỏi.
- **Lồng ghép kỹ năng:** Tích hợp một cách tự nhiên các nội dung giáo dục về an toàn giao thông, bảo vệ môi trường, và kỹ năng sống cần thiết.
- **Phát triển thể chất & Dinh dưỡng:** Chú trọng các hoạt động vận động và cung cấp kiến thức dinh dưỡng phù hợp.

**Thông tin yêu cầu cụ thể:**
- **Lĩnh vực:** ${request.activityType}
- **Độ tuổi:** ${request.ageGroup}
- **Chủ đề:** ${request.topic}
- **Đề tài:** ${request.subject}
- **Thời gian dự kiến:** ${request.duration}
- **Người soạn:** ${request.teacherName}
- **Đơn vị:** ${request.schoolName}
- **Ngày soạn:** ${formatDate(request.preparationDate)}
- **Ngày dạy:** ${formatDate(request.teachingDate)}
`;

    const outputRequirementHeader = `
**YÊU CẦU ĐỊNH DẠNG (RẤT QUAN TRỌNG):**
- **BẮT ĐẦU TRỰC TIẾP VÀO NỘI DUNG GIÁO ÁN.** Không thêm bất kỳ lời chào, câu giới thiệu, hay lời dẫn dắt nào.
- Viết nội dung chi tiết, chuyên nghiệp, sử dụng ngôn ngữ sư phạm chuẩn mực.
- **Sử dụng ngữ pháp tiếng Việt đầy đủ**, bao gồm dấu chấm (.), dấu phẩy (,) để câu văn mạch lạc, rõ nghĩa.
- Sử dụng định dạng Markdown để làm nổi bật các đề mục. Ví dụ: dùng \`**I. MỤC TIÊU**\`.
- **Quy tắc sử dụng gạch đầu dòng (-):**
  - **Sử dụng dấu gạch ngang (-)** cho các mục liệt kê không có số thứ tự (ví dụ: các đồ dùng trong phần **CHUẨN BỊ**).
  - **KHÔNG sử dụng dấu gạch ngang (-)** cho các dòng nội dung chi tiết nằm dưới một đề mục đã có số thứ tự (ví dụ: dưới mục \`**1. Kiến thức:\`**).
- **TUYỆT ĐỐI KHÔNG** sử dụng các ký tự như \`*\`, \`#\`, \`.\` hay các ký tự đặc biệt khác ở đầu dòng cho các mục liệt kê.

- **Ví dụ về định dạng đúng:**
  \`\`\`
  **I. MỤC TIÊU**

  **1. Kiến thức:**
  Trẻ biết nước tồn tại ở 3 trạng thái.
  Trẻ hiểu được chu trình tuần hoàn của nước.

  **2. Kỹ năng:**
  Rèn luyện và phát triển kỹ năng quan sát, so sánh.

  **II. CHUẨN BỊ**

  - Đồ dùng của cô: Video, bình đun siêu tốc.
  - Đồ dùng của trẻ: Mỗi nhóm 1 khay thí nghiệm.
  \`\`\`
`;

    let formatSpecificInstructions = '';
    if (request.format === 'with-columns') {
        formatSpecificInstructions = `
**Yêu cầu định dạng đặc biệt (Chia cột - RẤT QUAN TRỌNG):**
Phần **III. TỔ CHỨC HOẠT ĐỘNG** phải được trình bày theo dạng 2 cột và phải **CỰC KỲ CHI TIẾT**.

- **Cấu trúc:** Mỗi hoạt động nhỏ là một đề mục phụ (ví dụ: \`**1. Mở đầu hoạt động: Gây hứng thú\`**). Dưới mỗi đề mục, phải có hai phần rõ ràng: \`**Hoạt động của cô:\`** và \`**Hoạt động của trẻ:\`**.
- **Mức độ chi tiết:**
  - **Hoạt động của cô:** Phải mô tả **từng bước**, **từng hành động**, **từng lời nói** của giáo viên. Ghi rõ câu hỏi cô đặt ra, lời dẫn dắt, cách cô tổ chức trò chơi, cách cô sử dụng đồ dùng dạy học. Lời nói của cô phải tự nhiên, phù hợp với lứa tuổi mầm non.
  - **Hoạt động của trẻ:** Phải mô tả **chi tiết và dự kiến các phản ứng** của trẻ. Trẻ sẽ trả lời câu hỏi của cô như thế nào? Trẻ sẽ tham gia hoạt động ra sao? Trẻ thực hiện các yêu cầu của cô như thế nào? Cần dự kiến cả những câu trả lời khác nhau của trẻ.

**VÍ DỤ MẪU VỀ MỨC ĐỘ CHI TIẾT (trích đoạn phần III):**
\`\`\`
**III. TỔ CHỨC HOẠT ĐỘNG**

**1. Mở đầu hoạt động: Gây hứng thú (3-4 phút)**
**Hoạt động của cô:**
- Cô tập trung trẻ lại, xúm xít quanh cô.
- Cô mở một bản nhạc nhẹ nhàng, vui tươi (Bài "Gia đình nhỏ, hạnh phúc to").
- Cô nói với giọng ấm áp, vui vẻ: "Cô chào các con! Các con có nghe thấy giai điệu quen thuộc không? Đó là bài hát gì nhỉ?"
- Cô trò chuyện cùng trẻ: "Bài hát nói về điều gì? À đúng rồi, về gia đình. Trong gia đình con có những ai nào?"
- Cô lắng nghe trẻ trả lời, gợi mở cho những trẻ còn nhút nhát.
- Cô dẫn dắt: "Mỗi chúng ta đều có một gia đình yêu thương. Hôm nay, cô cháu mình sẽ cùng nhau khám phá một điều rất thú vị về gia đình qua đề tài '${request.subject}' nhé!"
**Hoạt động của trẻ:**
- Trẻ ngồi quây quần bên cô.
- Trẻ lắng nghe nhạc và hưởng ứng theo giai điệu.
- Trẻ trả lời: "Bài hát Gia đình nhỏ, hạnh phúc to ạ!"
- Trẻ trả lời câu hỏi của cô: "Bài hát nói về gia đình ạ!", "Gia đình con có bố, mẹ, anh trai và con ạ!", "Nhà con có bà nữa ạ!"...
- Trẻ hào hứng, chú ý lắng nghe cô giới thiệu bài học.
\`\`\`
---
Bây giờ, hãy tạo một giáo án **hoàn chỉnh**, bao gồm đầy đủ các phần **I. MỤC TIÊU**, **II. CHUẨN BỊ**, và **III. TỔ CHỨC HOẠT ĐỘNG** theo đúng các yêu cầu và định dạng chi tiết đã nêu trên.`;
    } else { // 'no-columns'
        formatSpecificInstructions = `
**Yêu cầu định dạng đặc biệt (Liền mạch):**
Phần **III. TỔ CHỨC HOẠT ĐỘNG** phải được chia thành các hoạt động nhỏ, tuần tự.
- Mỗi hoạt động là một đề mục phụ. Ví dụ: \`**Hoạt động 1: [Tên hoạt động]\`**.
---
Bây giờ, hãy tạo một giáo án **hoàn chỉnh**, bao gồm đầy đủ các phần **I. MỤC TIÊU**, **II. CHUẨN BỊ**, và **III. TỔ CHỨC HOẠT ĐỘNG** theo đúng định dạng được yêu cầu.`;
    }

    return commonDirectives + outputRequirementHeader + formatSpecificInstructions;
};


const buildOutdoorActivityPrompt = (request: LessonPlanRequest, learningActivity: string): string => {
    return `Bạn là một chuyên gia giáo dục mầm non sáng tạo.

**Ngữ cảnh:**
Bạn vừa hoàn thành việc soạn thảo một giáo án cho **Hoạt động học** chính. Bây giờ, bạn cần thiết kế một hoạt động bổ trợ.

**Nhiệm vụ:**
Phân tích kỹ lưỡng **Mục tiêu (Kiến thức, Kỹ năng, Thái độ)** và **Nội dung** của giáo án Hoạt động học được cung cấp dưới đây. Dựa trên đó, hãy soạn thảo một **Hoạt động ngoài trời** thật **chi tiết, đầy đủ và có tính liên kết chặt chẽ** để củng cố và mở rộng kiến thức cho trẻ.

**Yêu cầu cho Hoạt động ngoài trời (phải đầy đủ các phần):**
- **I. MỤC TIÊU:** Nêu rõ mục tiêu (kiến thức, kỹ năng, thái độ) của riêng hoạt động này, nhưng phải hỗ trợ cho mục tiêu của hoạt động học chính.
- **II. CHUẨN BỊ:** Liệt kê chi tiết các đồ dùng, học liệu, và sự chuẩn bị về không gian, địa điểm.
- **III. CÁCH TIẾN HÀNH:** Mô tả chi tiết, từng bước cách tổ chức hoạt động cho trẻ, bao gồm lời nói, hành động của cô và dự kiến hoạt động của trẻ. Hoạt động phải đảm bảo vui vẻ, an toàn.

**YÊU CẦU ĐỊNH DẠNG (RẤT QUAN TRỌNG):**
- **BẮT ĐẦU TRỰC TIẾP VÀO NỘI DUNG.** Không thêm bất kỳ lời chào, câu giới thiệu, hay lời dẫn dắt nào (ví dụ: "Tuyệt vời! Dựa trên giáo án...").
- Viết nội dung chi tiết, chuyên nghiệp, sử dụng ngôn ngữ sư phạm chuẩn mực.
- **Sử dụng ngữ pháp tiếng Việt đầy đủ**, bao gồm dấu chấm (.), dấu phẩy (,) để câu văn mạch lạc, rõ nghĩa.
- Sử dụng định dạng Markdown để làm nổi bật các đề mục. Ví dụ: dùng \`**I. MỤC TIÊU**\`.
- **Quy tắc sử dụng gạch đầu dòng (-):**
  - **Sử dụng dấu gạch ngang (-)** cho các mục liệt kê không có số thứ tự (ví dụ: các đồ dùng trong phần **CHUẨN BỊ**).
  - **KHÔNG sử dụng dấu gạch ngang (-)** cho các dòng nội dung chi tiết nằm dưới một đề mục đã có số thứ tự (ví dụ: dưới mục \`**1. Kiến thức:\`**).
- **TUYỆT ĐỐI KHÔNG** sử dụng các ký tự như \`*\`, \`#\`, \`.\` hay các ký tự đặc biệt khác ở đầu dòng cho các mục liệt kê.

**Giáo án Hoạt động học để phân tích và làm cơ sở:**
---
${learningActivity}
---

Bây giờ, hãy viết nội dung đầy đủ cho Hoạt động ngoài trời.`;
};


const buildCornerActivityPrompt = (request: LessonPlanRequest, learningActivity: string): string => {
    return `Bạn là một chuyên gia giáo dục mầm non, rất giỏi thiết kế các góc chơi.

**Ngữ cảnh:**
Bạn vừa hoàn thành việc soạn thảo một giáo án cho **Hoạt động học** chính. Bây giờ, bạn cần thiết kế các hoạt động góc để củng cố bài học.

**Nhiệm vụ:**
Phân tích kỹ lưỡng **Mục tiêu (Kiến thức, Kỹ năng, Thái độ)** và **Nội dung** của giáo án Hoạt động học được cung cấp dưới đây. Dựa trên đó, hãy soạn thảo nội dung cho các **Hoạt động góc** thật **chi tiết, đầy đủ và có tính liên kết chặt chẽ**.

**Yêu cầu cho Hoạt động góc (phải đầy đủ và chi tiết):**
- Đề xuất hoạt động cho ít nhất 3-4 góc chơi phù hợp với chủ đề (ví dụ: Góc xây dựng, Góc nghệ thuật, Góc sách truyện, Góc thiên nhiên, Góc phân vai...).
- **Với mỗi góc, phải trình bày đầy đủ 3 phần:**
  - **1. Mục tiêu:** Trẻ học được gì, rèn luyện kỹ năng gì ở góc đó. Mục tiêu này phải củng cố cho mục tiêu chung của bài học.
  - **2. Chuẩn bị:** Liệt kê chi tiết những đồ dùng, vật liệu, học liệu gì cần có ở góc, cách sắp xếp chúng sao cho hấp dẫn.
  - **3. Gợi ý hoạt động:** Mô tả cụ thể trẻ sẽ chơi gì, làm gì. Quan trọng nhất là mô tả cách cô giáo có thể gợi ý, đặt câu hỏi mở, và tương tác để nâng cao trải nghiệm học tập của trẻ tại góc chơi.

**YÊU CẦU ĐỊNH DẠNG (RẤT QUAN TRỌNG):**
- **BẮT ĐẦU TRỰC TIẾP VÀO NỘI DUNG.** Không thêm bất kỳ lời chào, câu giới thiệu, hay lời dẫn dắt nào.
- Viết nội dung chi tiết, chuyên nghiệp, sử dụng ngôn ngữ sư phạm chuẩn mực.
- **Sử dụng ngữ pháp tiếng Việt đầy đủ**, bao gồm dấu chấm (.), dấu phẩy (,) để câu văn mạch lạc, rõ nghĩa.
- Sử dụng định dạng Markdown để làm nổi bật các đề mục chính. Ví dụ: dùng \`**I. GÓC XÂY DỰNG**\`.
- **Quy tắc sử dụng gạch đầu dòng (-):**
  - **Sử dụng dấu gạch ngang (-)** cho các mục liệt kê không có số thứ tự (ví dụ: các đồ dùng trong phần **CHUẨN BỊ**).
  - **KHÔNG sử dụng dấu gạch ngang (-)** cho các dòng nội dung chi tiết nằm dưới một đề mục đã có số thứ tự (ví dụ: dưới mục \`**1. Mục tiêu:\`**).
- **TUYỆT ĐỐI KHÔNG** sử dụng các ký tự như \`*\`, \`#\`, \`.\` hay các ký tự đặc biệt khác ở đầu dòng cho các mục liệt kê.

**Giáo án Hoạt động học để phân tích và làm cơ sở:**
---
${learningActivity}
---

Bây giờ, hãy viết nội dung đầy đủ và chi tiết cho các Hoạt động góc.`;
};


// --- API CALL FUNCTIONS ---

const generateStringContent = async (prompt: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.7,
            topP: 0.9,
        },
    });
    return response.text;
};

export const generateLearningActivity = async (request: LessonPlanRequest, apiKey: string): Promise<string> => {
    const prompt = buildLearningActivityPrompt(request);
    try {
        return await generateStringContent(prompt, apiKey);
    } catch (error) {
        console.error("Lỗi khi tạo Hoạt động học:", error);
        throw new Error("Không thể tạo Hoạt động học. Vui lòng thử lại sau.");
    }
};

export const generateOutdoorActivity = async (request: LessonPlanRequest, learningActivity: string, apiKey: string): Promise<string> => {
    const prompt = buildOutdoorActivityPrompt(request, learningActivity);
    try {
        return await generateStringContent(prompt, apiKey);
    } catch (error) {
        console.error("Lỗi khi tạo Hoạt động ngoài trời:", error);
        throw new Error("Không thể tạo Hoạt động ngoài trời. Vui lòng thử lại sau.");
    }
};

export const generateCornerActivity = async (request: LessonPlanRequest, learningActivity: string, apiKey: string): Promise<string> => {
    const prompt = buildCornerActivityPrompt(request, learningActivity);
    try {
        return await generateStringContent(prompt, apiKey);
    } catch (error) {
        console.error("Lỗi khi tạo Hoạt động góc:", error);
        throw new Error("Không thể tạo Hoạt động góc. Vui lòng thử lại sau.");
    }
};

// --- REFINEMENT FUNCTIONALITY (Kept as single call for context) ---

const buildRefinePrompt = (
  currentPlan: LessonPlanParts,
  history: ChatMessage[],
  newMessage: string
): string => {
  const formattedHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  return `
    Bạn là một trợ lý AI chuyên chỉnh sửa giáo án mầm non.

    **Bộ giáo án hiện tại:**
    \`\`\`json
    ${JSON.stringify(currentPlan, null, 2)}
    \`\`\`

    **Lịch sử trò chuyện (nếu có):**
    ${formattedHistory}

    **Yêu cầu mới nhất từ người dùng:**
    user: ${newMessage}

    **Nhiệm vụ của bạn:**
    1. Đọc và hiểu yêu cầu mới nhất của người dùng.
    2. Tạo ra một phiên bản **mới** của toàn bộ bộ giáo án (cả 3 phần \`learningActivity\`, \`outdoorActivity\`, \`cornerActivity\`) dựa trên yêu cầu chỉnh sửa.
    3. Viết một câu trả lời ngắn gọn, thân thiện cho người dùng, xác nhận rằng bạn đã thực hiện thay đổi.
    4. **QUAN TRỌNG:** Khi tạo lại giáo án, hãy tuân thủ nghiêm ngặt các quy tắc định dạng sau:
      - **BẮT ĐẦU TRỰC TIẾP VÀO NỘI DUNG CỦA TỪNG PHẦN GIÁO ÁN.** Không thêm bất kỳ lời chào hay câu giới thiệu nào vào nội dung của các phần giáo án.
      - Viết nội dung chi tiết, chuyên nghiệp, sử dụng ngôn ngữ sư phạm chuẩn mực.
      - **Sử dụng ngữ pháp tiếng Việt đầy đủ**, bao gồm dấu chấm (.), dấu phẩy (,) để câu văn mạch lạc, rõ nghĩa.
      - Sử dụng định dạng Markdown để làm nổi bật các đề mục. Ví dụ: dùng \`**I. MỤC TIÊU**\`.
      - **Quy tắc sử dụng gạch đầu dòng (-):**
        - **Sử dụng dấu gạch ngang (-)** cho các mục liệt kê không có số thứ tự (ví dụ: các đồ dùng trong phần **CHUẨN BỊ**).
        - **KHÔNG sử dụng dấu gạch ngang (-)** cho các dòng nội dung chi tiết nằm dưới một đề mục đã có số thứ tự (ví dụ: dưới mục \`**1. Kiến thức:\`**).
      - **TUYỆT ĐỐI KHÔNG** sử dụng các ký tự như \`*\`, \`#\`, \`.\` hay các ký tự đặc biệt khác ở đầu dòng cho các mục liệt kê.

    **Yêu cầu về cấu trúc đầu ra:**
    Bạn PHẢI trả lời bằng một đối tượng JSON duy nhất.
    Đối tượng JSON phải có 2 thuộc tính:
    1. \`lessonPlan\`: Một đối tượng chứa 3 thuộc tính \`learningActivity\`, \`outdoorActivity\`, \`cornerActivity\` đã được cập nhật.
    2. \`chatResponse\`: Một chuỗi (string) chứa câu trả lời của bạn cho người dùng.

    Bây giờ, hãy xử lý yêu cầu và trả về đối tượng JSON theo đúng định dạng.
  `;
};

const lessonPlanPartsSchema = {
    type: Type.OBJECT,
    properties: {
        learningActivity: { type: Type.STRING, description: "Nội dung chi tiết cho giáo án hoạt động học chính" },
        outdoorActivity: { type: Type.STRING, description: "Nội dung gợi ý cho hoạt động ngoài trời liên quan" },
        cornerActivity: { type: Type.STRING, description: "Nội dung gợi ý cho các hoạt động góc liên quan" },
    },
    required: ["learningActivity", "outdoorActivity", "cornerActivity"],
};

const refineResponseSchema = {
    type: Type.OBJECT,
    properties: {
        lessonPlan: lessonPlanPartsSchema,
        chatResponse: { type: Type.STRING, description: "Câu trả lời dạng trò chuyện cho người dùng" }
    },
    required: ["lessonPlan", "chatResponse"],
};

export const refineLessonPlan = async (
  currentPlan: LessonPlanParts,
  history: ChatMessage[],
  newMessage: string,
  apiKey: string,
): Promise<RefineResponse> => {
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
    throw new Error("Không thể chỉnh sửa giáo án. Vui lòng thử lại sau.");
  }
};
