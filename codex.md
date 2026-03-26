# NetUp MVP - Codex Handoff Context

## 1) Mục tiêu dự án
- Đây là demo frontend MVP cho NetUp (React + Vite + TypeScript).
- Mục tiêu demo:
  - thể hiện rõ luồng người chơi/chủ sân/quản trị,
  - nhấn mạnh khác biệt AI,
  - mô phỏng logic booking/pool/rental bằng mock data local.

## 2) Cách chạy
- Yêu cầu: Node.js 18+, npm 9+.
- Lệnh:
  - `npm install`
  - `npm run dev`
  - `npm run build`

## 3) Stack & kiến trúc
- UI: React + Tailwind.
- Router: React Router.
- Store: Context + `useReducer` tại `src/app/providers/AppStoreProvider.tsx`.
- Dữ liệu: mock local trong `src/mocks`.

## 4) Domain hiện tại (điểm quan trọng)
- `Court` có các field quan trọng:
  - `complexName`: tên khu sân,
  - `subCourtName`: tên sân nhỏ (dùng hiển thị chính),
  - `maxRentalDurationMinutes`: giới hạn phút/lần thuê do owner đặt.
- `Session` là đơn vị khung giờ.
- `PoolPostConfig` lưu cấu hình pool do người chơi tạo:
  - `totalSlots`, `hostSlots`, `sessionId`, ...

## 5) Mock data hiện tại
- Khu vực dữ liệu: gần Khu Công nghệ cao Hòa Lạc, Hà Nội.
- File chính:
  - `src/mocks/courts.ts`
  - `src/mocks/sessions.ts`

## 6) Routes chính
- `/player/discovery`: trang chọn luồng cho player.
- `/player/pool-posts`: luồng kèo chờ ghép.
- `/player/rent-courts`: luồng thuê nguyên sân (mở lịch + tạo slot thuê trực tiếp).
- `/player/session/:sessionId`: trang chi tiết slot (có lịch sân 7 ngày).
- `/player/booking/:sessionId`: xác nhận đặt.
- `/player/booking-success/:bookingId`: QR thành công.
- `/owner/courts`: quản lý sân + giới hạn thời lượng thuê.

## 7) Luồng Player hiện tại

### 7.1 Kèo chờ ghép
- Trang: `src/pages/player/PlayerPoolPostsPage.tsx`.
- Flow tạo pool:
  1. Lọc theo môn.
  2. Chọn sân.
  3. Chọn khung giờ.
  4. Nhập tổng slot mong muốn.
  5. Nhập slot bản thân giữ trước.
- Gọi store action `createPoolPost(...)`.

### 7.2 Thuê nguyên sân
- Trang: `src/pages/player/PlayerRentCourtsPage.tsx`.
- Khi bấm `Thuê sân (mở lịch)` ở card sân:
  - hiển thị lịch 7 ngày của đúng sân đó,
  - có form tạo slot thuê trực tiếp (datetime + duration),
  - giới hạn duration theo `court.maxRentalDurationMinutes`,
  - tạo slot thành công sẽ điều hướng sang booking full-court.
- Gọi store action `createRentalSlot(...)`.

### 7.3 Chi tiết slot
- Trang: `src/pages/player/PlayerSessionDetailPage.tsx`.
- Hiển thị lịch 7 ngày cùng sân, tag phân biệt pool/rental.
- Với source rental: có thêm form tạo slot thuê mới ngay trong trang chi tiết.

## 8) Luồng Owner hiện tại
- Trang: `src/pages/owner/OwnerCourtsPage.tsx`.
- Có block “Biểu mẫu đăng ký sân (demo)” hiển thị:
  - khu sân, sân nhỏ, môn, địa chỉ.
- Owner có thể chỉnh:
  - `Giới hạn thời lượng 1 lần thuê (phút)`.
- Gọi store action `updateCourtRentalLimit(courtId, minutes)`.

## 9) Store actions quan trọng (AppStoreProvider)
- `createBooking(draft)`
- `checkInByCode(code)`
- `createPoolPost({ sessionId, totalSlots, hostSlots })`
- `createRentalSlot({ courtId, startsAt, durationMinutes })`
  - có check overlap khung giờ trên cùng sân.
- `updateCourtRentalLimit(courtId, maxRentalDurationMinutes)`
- `updateAdminConfig(nextConfig)`
- `savePlayerAssessment(assessment)`

## 10) UI component quan trọng
- Calendar tuần: `src/shared/components/WeeklySessionCalendar.tsx`
  - render 7 ngày, tag slot, tooltip sân + địa chỉ.
- Card post dùng chung: `src/features/discovery/SessionPostCard.tsx`.
- Mapping ảnh post theo môn:
  - `src/shared/utils/postBackground.ts`
  - ảnh trong `src/shared/assets/post-backgrounds/`.

## 11) Quy ước hiển thị hiện tại
- Ưu tiên hiển thị `subCourtName` thay vì title tự do để người dùng hiểu đây là cùng một sân nhỏ.
- Có thể hiển thị thêm `complexName` để giữ ngữ cảnh khu sân.
- Lịch được thu gọn để dễ nhìn hơn so với phiên bản cũ.

## 12) Giới hạn hiện tại (đã biết)
- Không có backend/database/auth thật.
- Tạo slot thuê/pool hiện chỉ cập nhật state trong phiên chạy app.
- Chưa có cơ chế phân quyền owner theo account thật.
- Check overlap slot là local in-memory, chưa có sync đa user.

## 13) Cách tiếp tục ở session sau (gợi ý cho Codex khác)
- Bước 1: đọc nhanh các file:
  - `src/app/providers/AppStoreProvider.tsx`
  - `src/pages/player/PlayerRentCourtsPage.tsx`
  - `src/pages/player/PlayerPoolPostsPage.tsx`
  - `src/pages/owner/OwnerCourtsPage.tsx`
  - `src/shared/components/WeeklySessionCalendar.tsx`
- Bước 2: chạy `npm run build` để xác nhận baseline xanh.
- Bước 3: nếu sửa logic flow booking/pool/rental, cập nhật đồng bộ:
  - store action,
  - page UI,
  - `README.md` (phần flow tương ứng).

## 14) Ghi chú tài liệu
- README chính: `README.md`.
- Context chatbot: `CHATBOT_CONTEXT.md`.
- Nhật ký yêu cầu cũ: `REQUIREMENTS_UPDATE_2026-03-24.md`.
