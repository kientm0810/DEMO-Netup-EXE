# Post Background Mapping

Folder này chứa ảnh nền cho toàn bộ post ở luồng Player (theo bộ môn).

## 1) File ảnh và phần hiển thị
- `badminton1.jpg`, `badminton2.jpg`, `badminton3.jpg`: dùng cho post môn `Badminton`.
- `football1.jpeg`, `football2.jpg`: dùng cho post môn `Football`.
- `tennis1.jpg`, `tennis2.jpg`: dùng cho post môn `Tennis`.
- Các file SVG cũ (`post-*.svg`) được giữ lại để tương thích tài nguyên cũ, nhưng không còn dùng cho card post chính.

## 2) Vị trí đang dùng trên web
- Trang: `Player Pool Posts` và `Player Rent Courts`
- Component chính: `src/features/discovery/SessionPostCard.tsx`
- Hàm mapping: `src/shared/utils/postBackground.ts`
- Cách chọn ảnh:
  - Mỗi môn có 1 nhóm ảnh riêng.
  - Ảnh được chọn theo seed (`courtId + sessionId`) để hiển thị đa dạng nhưng vẫn ổn định.

## 3) Cách thay ảnh của bạn
- Giữ nguyên tên file để không cần sửa code.
- Nếu đổi tên file, cập nhật mapping trong `src/shared/utils/postBackground.ts`.
