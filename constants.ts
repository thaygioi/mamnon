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
      format: 'no-columns',
    },
    response: JSON.stringify({
      lessonPlanContent: `**GIÁO ÁN**
**LĨNH VỰC PHÁT TRIỂN: KHÁM PHÁ KHOA HỌC**

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
`
    }),
  }
];