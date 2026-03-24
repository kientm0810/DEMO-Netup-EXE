# Post Background Mapping

Folder này chứa ảnh nền cho toàn bộ post ở trang Discovery (theo bộ môn).

## 1) File ảnh và phần hiển thị
- `post-badminton.svg`: dùng cho post của môn `Badminton` (Cầu lông).
- `post-football.svg`: dùng cho post của môn `Football` (Bóng đá).
- `post-tennis.svg`: dùng cho post của môn `Tennis`.

## 2) Vị trí đang dùng trên web
- Trang: `Player Discovery`
- Component: `src/pages/player/PlayerDiscoveryPage.tsx`
- Điều kiện áp dụng ảnh nền:
  - Mọi session/post đều có ảnh nền theo bộ môn.
  - Post tuyển slot trống (`allowsSoloJoin = true` và `openSlots > 0`) có thêm nhãn nổi bật.

## 3) Cách thay ảnh của bạn
- Giữ nguyên đúng tên file ở trên rồi thay nội dung ảnh.
- Hoặc đổi tên file và cập nhật import tương ứng trong `PlayerDiscoveryPage.tsx`.
