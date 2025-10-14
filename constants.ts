import { LessonPlanRequest } from './types';

export const ACTIVITY_TYPES = [
  'Phát triển thể chất',
  'Phát triển nhận thức',
  'Phát triển ngôn ngữ',
  'Phát triển thẩm mỹ',
  'Phát triển tình cảm và kỹ năng xã hội',
];

export const AGE_GROUPS = [
  'Trẻ 3-6 tháng',
  'Trẻ 6-12 tháng',
  'Trẻ 12-18 tháng',
  'Trẻ 18-24 tháng',
  'Trẻ 24-36 tháng',
  'Trẻ 3-4 tuổi',
  'Trẻ 4-5 tuổi',
  'Trẻ 5-6 tuổi',
];

export interface LessonPlanExample {
  request: LessonPlanRequest;
  response: string; // This will be a JSON string
}

export const LESSON_PLAN_EXAMPLES: LessonPlanExample[] = [
  {
    request: {
      activityType: 'Khám phá Khoa học',
      ageGroup: 'Trẻ 5-6 tuổi',
      topic: 'Nước và các hiện tượng tự nhiên',
      subject: 'Sự kỳ diệu của nước',
      duration: '30-35 phút',
      preparationDate: '01/10/2023',
      teachingDate: '05/10/2023',
      teacherName: 'Nguyễn Thị An',
      schoolName: 'Trường Mầm non Ánh Dương',
    },
    response: JSON.stringify({
      learningActivity: `GIÁO ÁN
LĨNH VỰC PHÁT TRIỂN: KHÁM PHÁ KHOA HỌC

**Chủ đề**: Nước và các hiện tượng tự nhiên
**Đề tài**: Sự kỳ diệu của nước
**Đối tượng**: Trẻ 5-6 tuổi
**Thời gian**: 30-35 phút
**Ngày soạn**: 01/10/2023
**Ngày dạy**: 05/10/2023
**Người dạy**: Nguyễn Thị An
**Đơn vị**: Trường Mầm non Ánh Dương

---

**I. MỤC TIÊU**

**1. Kiến thức**:
- Trẻ biết nước tồn tại ở 3 trạng thái: lỏng (nước uống), rắn (đá viên), khí (hơi nước).
- Trẻ hiểu được chu trình tuần hoàn đơn giản của nước trong tự nhiên.
- Trẻ nhận biết được tầm quan trọng của nước đối với sự sống.

**2. Kỹ năng**:
- Rèn luyện và phát triển kỹ năng quan sát, so sánh, phán đoán.
- Phát triển khả năng làm việc nhóm khi tham gia thí nghiệm.
- Phát triển ngôn ngữ mạch lạc khi mô tả lại hiện tượng quan sát được.

**3. Thái độ**:
- Trẻ hứng thú, tích cực tham gia vào các hoạt động.
- Giáo dục trẻ ý thức sử dụng nước tiết kiệm và giữ gìn nguồn nước sạch.

**II. CHUẨN BỊ**

- **Đồ dùng của cô**: Video về vòng tuần hoàn của nước, bình đun siêu tốc, khay đá, cốc thủy tinh.
- **Đồ dùng của trẻ**: Mỗi nhóm 1 khay thí nghiệm (đá viên, cốc nước), tranh tô màu vòng tuần hoàn.

**III. TỔ CHỨC HOẠT ĐỘNG**

**1. Ổn định, gây hứng thú (3-4 phút)**
- Cô và trẻ cùng hát bài "Cho tôi đi làm mưa với".
- Trò chuyện về mưa và nước để dẫn dắt vào bài học.

**2. Nội dung chính: Khám phá sự kỳ diệu của nước (20-25 phút)**
- **Thí nghiệm 1: Nước ở trạng thái rắn (đá)**: Trẻ quan sát đá tan chảy thành nước.
- **Thí nghiệm 2: Nước ở trạng thái khí (hơi)**: Cô cho trẻ quan sát hơi nước bốc lên từ bình đun sôi và ngưng tụ trên đĩa.
- **Tìm hiểu Vòng tuần hoàn của nước**: Xem video và giải thích bằng tranh.

**3. Củng cố: Trò chơi "Bé tô màu vòng tuần hoàn" (5-7 phút)**
- Trẻ về nhóm tô màu tranh vòng tuần hoàn của nước.

**IV. KẾT THÚC (1-2 phút)**
- Nhận xét, khen ngợi và giáo dục trẻ tiết kiệm nước.
`,
      outdoorActivity: `GỢI Ý HOẠT ĐỘNG NGOÀI TRỜI

**Liên kết chủ đề**: Sự kỳ diệu của nước
**Mục đích**: Củng cố kiến thức về các trạng thái của nước và vai trò của ánh nắng mặt trời.

---

**1. Quan sát có mục đích: Tìm nước ở đâu?**
- **Mục tiêu**: Giúp trẻ nhận ra nước có ở khắp mọi nơi trong môi trường xung quanh.
- **Cách tiến hành**:
- Cô dẫn trẻ đi dạo quanh sân trường.
- Đặt câu hỏi gợi mở: "Chúng ta có thể tìm thấy nước ở đâu nhỉ?" (vũng nước, lá cây sau khi tưới, vòi nước, bể cá...).
- Cho trẻ chỉ và gọi tên những nơi có nước.

**2. Trò chơi vận động: "Trời nắng, trời mưa"**
- **Mục tiêu**: Rèn luyện phản xạ nhanh nhẹn, tạo không khí vui vẻ.
- **Cách tiến hành**:
- Cô hô "Trời mưa", trẻ chạy tìm chỗ trú.
- Cô hô "Trời nắng", trẻ đi lại tự do.
- Cô hô "Mưa rào", trẻ chạy nhanh hơn.

**3. Thí nghiệm nhỏ: Đá tan nhanh hơn ở đâu?**
- **Mục tiêu**: Giúp trẻ nhận biết tác động của nhiệt độ (ánh nắng) lên trạng thái của nước.
- **Cách tiến hành**:
- Chuẩn bị 2 đĩa đá viên.
- Đặt 1 đĩa ngoài nắng và 1 đĩa trong bóng râm.
- Cho trẻ quan sát và so sánh xem đĩa đá nào tan nhanh hơn và giải thích tại sao.
`,
      cornerActivity: `GỢI Ý HOẠT ĐỘNG GÓC

**Liên kết chủ đề**: Sự kỳ diệu của nước
**Mục đích**: Mở rộng và cho trẻ tự do sáng tạo dựa trên kiến thức đã học.

---

**1. Góc Xây dựng / Lắp ráp:**
- **Nội dung**: Xây dựng "Công viên nước" hoặc "Hệ thống dẫn nước".
- **Nguyên vật liệu**: Các khối lego, chai lọ tái chế, ống hút, máng nước nhỏ.
- **Mục tiêu**: Rèn luyện kỹ năng lắp ráp, tư duy không gian và hợp tác nhóm.

**2. Góc Nghệ thuật / Tạo hình:**
- **Nội dung**:
- Vẽ tranh về mưa, về biển.
- Làm thuyền giấy và thả vào chậu nước.
- Thổi màu nước qua ống hút để tạo "cơn mưa màu sắc".
- **Nguyên vật liệu**: Giấy, bút màu, màu nước, ống hút, chậu nước.
- **Mục tiêu**: Phát triển khả năng sáng tạo, thẩm mỹ và sự khéo léo của đôi tay.

**3. Góc Khoa học / Thiên nhiên:**
- **Nội dung**:
- Thí nghiệm "Vật chìm, vật nổi": Trẻ thả các đồ vật khác nhau vào nước và quan sát.
- Chăm sóc cây xanh: Trẻ tự tay dùng bình nhỏ để tưới nước cho cây trong góc thiên nhiên.
- **Nguyên vật liệu**: Chậu nước, các vật dụng (lá cây, sỏi, miếng xốp, thìa sắt...), bình tưới cây.
- **Mục tiêu**: Kích thích tính tò mò, khả năng phán đoán và hình thành tình yêu thiên nhiên.

**4. Góc Sách / Văn học:**
- **Nội dung**: Xem các loại sách, tranh ảnh về chủ đề nước (sông, hồ, biển, các loài vật sống dưới nước).
- **Mục tiêu**: Phát triển văn hóa đọc, làm quen với hình ảnh và từ ngữ mới.
`
    }),
  }
];