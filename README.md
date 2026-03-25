# NetUp Frontend MVP Demo

## 1) Tổng quan dự án
Đây là bản demo frontend MVP cho NetUp, tập trung vào:
- Trình bày luồng sản phẩm rõ ràng cho nhà đầu tư.
- Click được end-to-end cho 3 vai trò: Người chơi, Chủ sân, Quản trị.
- Làm nổi bật điểm khác biệt AI (trợ lý + gợi ý sân theo nhu cầu).

## 2) Mục tiêu bản demo hiện tại
- Dùng tiếng Việt tối đa ở giao diện.
- UX dễ hiểu khi nhìn lướt.
- Có hình ảnh minh họa và icon để tăng trực quan.
- Bản đồ hiển thị trạng thái slot theo dạng đã chiếm/tổng (ví dụ: `6/8`).
- AI feature được đặt ở vị trí nổi bật để nhà đầu tư thấy ngay.

## 3) Những phần đã được nâng cấp
- Landing page theo hướng “investor-friendly”:
  - Hero có ảnh minh họa lớn.
  - Thẻ vai trò có icon.
  - Khối highlight riêng cho AI.
- Discovery:
  - Chế độ List / Map.
  - Marker map hiển thị trực tiếp số slot đã chiếm.
  - Tô nổi bật điểm được AI đề xuất theo level người chơi.
- AI Chatbot:
  - Trả lời theo context file + knowledge base mock.
  - Gợi ý session theo môn, khu vực, ngân sách, level.
  - Có panel nhập nhanh để demo logic AI với nhà đầu tư.
- Self-assessment:
  - Người chơi tự đánh giá năng lực.
  - Hệ thống phân cấp level để phục vụ recommendation.

## 4) Stack kỹ thuật
- React + Vite + TypeScript
- Tailwind CSS
- React Router
- React Leaflet + Leaflet (map)
- Mock data local (TS object)

## 5) Routing
- `/`
- `/player/discovery`
- `/player/session/:sessionId`
- `/player/booking/:sessionId`
- `/player/booking-success/:bookingId`
- `/player/bookings`
- `/player/assessment`
- `/owner/dashboard`
- `/owner/courts`
- `/owner/check-in`
- `/admin/dashboard`
- `/admin/config`
- `/assistant/chatbot`
- `*`

## 6) Dữ liệu mock
- `players.ts`
- `courts.ts` (có tọa độ lat/lng cho map)
- `sessions.ts`
- `bookings.ts`
- `ownerAnalytics.ts`
- `adminConfig.ts`
- `playerAssessments.ts`
- `chatbotKnowledge.ts`

Toàn bộ state dùng chung qua `AppStoreProvider` để dữ liệu đồng bộ giữa các trang.

## 7) File tài liệu quan trọng
- `CHATBOT_CONTEXT.md`: context hướng dẫn cho chatbot demo.
- `REQUIREMENTS_UPDATE_2026-03-24.md`: log yêu cầu update và phạm vi đã làm.

## 8) Cách chạy
Yêu cầu:
- Node.js 18+
- npm 9+

Lệnh:
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
npm run preview
```

## 9) Assumption
- Không có backend/database/auth thật.
- QR chỉ là mock hiển thị.
- Chatbot là rule-based demo theo context nội bộ (không gọi LLM thật).
- Kết quả self-assessment dùng để gợi ý, chưa phải cơ chế kiểm soát truy cập.

## 10) Ảnh nền post tuyển slot
- Tất cả post ở Discovery có ảnh nền theo từng môn.
- Post tuyển slot trống (session cho phép ghép lẻ và còn slot) có thêm nhãn nổi bật.
- Bộ ảnh nằm tại: `src/shared/assets/post-backgrounds/`
- File mapping chi tiết nằm tại: `src/shared/assets/post-backgrounds/README.md`

## 11) Vị trí người dùng và chỉ đường (demo)
- Discovery có nút lấy vị trí người dùng từ trình duyệt.
- Nếu có vị trí, mỗi post hiển thị khoảng cách ở bên trái tên địa điểm.
- Có nút mở đường đi Google Maps theo nhiều phương tiện (xe máy/ô tô, đi bộ, xe đạp, công cộng).
- Khoảng cách trong app là ước lượng demo theo tọa độ GPS.

## 12) Owner Promote Slot -> Player Post
- Owner quản lý nhiều sân, mỗi sân có danh sách khung giờ và số người thuê theo slot.
- Owner có thể chọn từng khung giờ để `Promote thành bài post` hoặc `Gỡ promote`.
- Discovery phía Player chỉ hiển thị các slot đã được promote thành bài post.
- Trang chi tiết bài post hiển thị rõ:
  - chi tiết sân
  - bài post đang cho khung giờ nào của sân
- Filter bộ môn ở Discovery được đổi sang dạng icon để trực quan và thân thiện hơn.
