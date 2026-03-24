# NetUp MVP - Nhật ký cập nhật yêu cầu (2026-03-24)

## 1) Yêu cầu bổ sung từ phía sản phẩm
1. Sau khi tìm kiếm/lọc ở trang khám phá, cần có tùy chọn xem trên bản đồ.
2. Đổi nhận diện màu chủ đạo sang tông xám - đỏ.
3. Thêm chatbot demo:
- Trả lời câu hỏi về tính năng website dựa trên file context nội bộ.
- Gợi ý sân/session theo nhu cầu đầu vào của người dùng.
4. Thêm form tự đánh giá năng lực người chơi:
- Người dùng tự nhập thông tin.
- Hệ thống phân cấp level.
- Dùng level để gợi ý session phù hợp.
5. Cập nhật README để phản ánh rõ yêu cầu và mục tiêu mới.
6. Có file riêng để lưu lại yêu cầu nhằm dễ theo dõi về sau.

## 2) Hạng mục đã triển khai
- Bổ sung chế độ `Danh sách / Bản đồ` ở trang khám phá người chơi.
- Tích hợp bản đồ bằng `react-leaflet`.
- Marker bản đồ hiển thị trực tiếp số slot đã chiếm/tổng (ví dụ `6/8`).
- Cập nhật theme xám - đỏ trên các layout và khối UI chính.
- Thêm trang chatbot: `/assistant/chatbot`.
- Bổ sung tài liệu context chatbot: `CHATBOT_CONTEXT.md`.
- Tạo knowledge base local: `src/mocks/chatbotKnowledge.ts`.
- Thêm trang tự đánh giá: `/player/assessment`.
- Kết quả đánh giá level được dùng cho Discovery và Chatbot recommendation.
- README gốc cập nhật đầy đủ mục tiêu, routing, dữ liệu mock và assumption.

## 3) Cập nhật UX theo mục tiêu trình bày cho nhà đầu tư
- Việt hóa mạnh phần giao diện người dùng.
- Bổ sung ảnh minh họa SVG cho Landing và khu vực AI.
- Bổ sung hệ thống icon cho thẻ vai trò và các điểm nhấn tính năng.
- Nêu bật AI ở Landing, Discovery và Chatbot để nhìn lướt vẫn thấy khác biệt.
- Tăng tính trực quan của map bằng marker dạng chip chứa số slot.

## 4) Ghi chú phạm vi
- Đây vẫn là bản MVP frontend demo.
- Không có backend/database/auth/payment thật.
- Chatbot là mô phỏng rule-based local, chưa tích hợp LLM/API thật.

## 5) Bổ sung theo yêu cầu mới (post tuyển slot)
- Thêm ảnh nền theo bộ môn cho các bài post tuyển slot trống ở Discovery.
- Tạo thư mục ảnh riêng: `src/shared/assets/post-backgrounds/`.
- Tạo file mapping: `src/shared/assets/post-backgrounds/README.md` để mô tả ảnh nào dùng cho phần nào.

## 6) Bổ sung theo yêu cầu mới (vị trí và khoảng cách)
- Áp ảnh nền theo bộ môn cho toàn bộ post ở Discovery (không chỉ post tuyển slot).
- Thêm nút lấy vị trí người dùng từ trình duyệt.
- Nếu có vị trí, hiển thị khoảng cách ở bên trái tên địa điểm trên card post.
- Thêm nút mở đường đi Google Maps theo nhiều phương tiện (xe máy/ô tô, đi bộ, xe đạp, công cộng).
- Ở map popup cũng hiển thị khoảng cách ước lượng và link chỉ đường Google Maps.
