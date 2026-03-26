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
  - Trang chọn luồng cho Player: `Kèo chờ ghép` hoặc `Thuê nguyên sân`.
  - Tách 2 trang demo riêng cho 2 hành vi người chơi:
    - Kèo chờ ghép (pool theo slot)
    - Thuê nguyên sân (chọn sân -> mở khung giờ)
  - Post card dạng nửa trên ảnh nền theo môn, nửa dưới thông tin slot + thao tác.
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
- `/player/pool-posts`
- `/player/rent-courts`
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
- `courts.ts` (tọa độ sân mock quanh khu Công nghệ cao Hòa Lạc, Hà Nội)
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
- Tất cả post player dùng bộ ảnh mới theo môn:
  - Cầu lông: `badminton1.jpg`, `badminton2.jpg`, `badminton3.jpg`
  - Bóng đá: `football1.jpeg`, `football2.jpg`
  - Tennis: `tennis1.jpg`, `tennis2.jpg`
- Mapping ảnh được xử lý trong `src/shared/utils/postBackground.ts`.
- File mô tả mapping chi tiết nằm tại: `src/shared/assets/post-backgrounds/README.md`

## 11) Vị trí người dùng và chỉ đường (demo)
- Các trang Player (`Kèo chờ ghép`, `Thuê nguyên sân`) có nút lấy vị trí người dùng từ trình duyệt.
- Nếu có vị trí, post card hiển thị thêm khoảng cách ước lượng từ người chơi tới sân.
- Khoảng cách trong app là ước lượng demo theo tọa độ GPS.

## 12) Logic quản lý sân & post (cập nhật mới)
- Chủ sân đăng ký dịch vụ NetUp theo mô hình:
  - tên `Khu sân`
  - tên `Sân nhỏ` (đơn vị hiển thị chính cho người chơi)
- Mỗi khung giờ của sân được coi là một đơn vị post theo slot.
- Với cùng một khung giờ, người chơi có thể đi theo 2 hướng:
  - tạo/tham gia `Pool chờ ghép` (post theo slot)
  - `Thuê nguyên sân`
- Loại post được quyết định từ hành vi người chơi ở từng luồng, không còn phụ thuộc thao tác promote thủ công của owner.

## 13) Luồng Player: Kèo chờ ghép
- Hiển thị danh sách post pool theo slot như luồng cũ nhưng giao diện trực quan hơn.
- Flow tạo pool được chuẩn hóa theo thứ tự:
  - Bước 1: lọc theo môn
  - Bước 2: chọn sân
  - Bước 3: chọn khung giờ
  - Bước 4: nhập tổng slot mong muốn cho cả sân
  - Bước 5: nhập số slot bản thân đăng ký trước
- Người chơi có thể tạo pool mới từ các khung giờ còn trống theo flow trên.
- Mỗi post dạng card:
  - nửa trên là ảnh nền theo môn (asset trong `src/shared/assets/post-backgrounds/`)
  - nửa dưới gồm: tên sân nhỏ, tên khu sân, địa chỉ, slot còn lại, khung giờ, khoảng cách (nếu có vị trí)
  - có nút `Xem chi tiết` và `Tham gia pool`

## 14) Luồng Player: Thuê nguyên sân
- Người chơi thấy danh sách sân trước.
- Khi bấm `Thuê sân (mở lịch)` ở một sân, trang thuê sân hiển thị ngay lịch hiện tại của chính sân đó.
- Người chơi có thể tự tạo một slot thuê mới ngay trên khối lịch này bằng cách nhập:
  - thời điểm bắt đầu
  - thời lượng thuê
- Sau khi tạo slot thành công, hệ thống điều hướng sang bước đặt sân cho slot vừa tạo.
- Mỗi khung giờ thuê hiển thị dạng post card giống chuẩn giao diện chung:
  - nửa trên ảnh nền theo môn
  - nửa dưới thông tin sân/slot/khung giờ/khoảng cách
  - có nút `Xem chi tiết` và `Đặt thuê sân`

## 15) Trang chi tiết post (pool hoặc thuê sân)
- Khi vào chi tiết một post, chỉ hiển thị lịch slot của đúng sân đó.
- Tiêu đề ưu tiên hiển thị theo `tên sân nhỏ` để tránh nhầm khi một sân có nhiều khung giờ.
- Lịch có tag trên timeslot để phân biệt:
  - `Pool chờ ghép`
  - `Thuê nguyên sân`
- Lịch được thu gọn kích thước để dễ quan sát hơn trên desktop.
- Người dùng có thể tiếp tục đặt theo đúng luồng đã đi vào (pool hoặc thuê sân).

## 16) Owner: quản lý đăng ký sân
- Trang Owner/Courts có block demo `Biểu mẫu đăng ký sân` hiển thị:
  - tên khu sân
  - tên sân nhỏ
  - môn đăng ký
  - địa chỉ
- Chủ sân có thể tự quyết định giới hạn thời lượng cho mỗi lần thuê sân (theo phút).
- Giới hạn này được áp dụng trực tiếp vào form tạo slot thuê của người chơi.
- Lịch quản lý slot của owner dùng tên sân nhỏ để đồng bộ cách nhìn với phía người chơi.

## 17) Tạo slot thuê trực tiếp trên lịch (mới)
- Ở luồng `Thuê nguyên sân`, người chơi không cần đi vòng qua nhiều bước:
  - chọn sân
  - mở lịch
  - tạo slot thuê trực tiếp trong cùng màn hình lịch
- Hệ thống kiểm tra trùng lịch trước khi tạo slot thuê mới.
- Nếu trùng lịch, hiển thị lỗi để người chơi đổi thời gian hoặc thời lượng.

## 18) Tu danh gia nang luc theo tung mon (moi)
- Trang `Player Assessment` da doi sang kieu questionnaire theo tung mon rieng:
  - Cau long
  - Bong da
  - Tennis
- Moi mon co bo cau hoi A/B/C de nguoi choi tu danh gia:
  - thoi gian da choi mon do
  - the luc/so phut choi lien tuc
  - tan suat choi
  - nang luc chien thuat
- He thong cham diem tu dong theo dap an va suy ra level:
  - Beginner
  - Intermediate
  - Advanced
- Du lieu duoc luu theo tung mon trong bang `player_sport_assessments`.

## 19) Rang buoc tao pool + hien thi assessment trong chi tiet post
- Khi tao post `Keo cho ghep`, nguoi choi bat buoc da hoan thanh tu danh gia cho dung mon cua san.
- Neu chua co assessment theo mon, he thong chan thao tac tao pool va yeu cau di den trang tu danh gia.
- Khi vao chi tiet 1 post pool:
  - Hien thi danh sach nguoi dang apply trong pool (host + thanh vien da booking solo)
  - Hien thi level va cac cau tra loi tu danh gia theo dung mon cua san
  - Giup nguoi choi quyet dinh co nen join pool hay khong.

## 20) Script database cho feature assessment moi
- `supabase/schema.sql` da duoc cap nhat them bang:
  - `player_sport_assessments`
- `supabase/migration_data_mock.sql` da co seed mau cho assessment theo mon.
- Neu project Supabase da tao schema cu, hay chay lai SQL update trong `schema.sql` roi chay seed `migration_data_mock.sql`.
