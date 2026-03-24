# Context Chatbot NetUp (Demo)

## Mục tiêu
File này là nguồn context để chatbot demo:
- Trả lời câu hỏi về tính năng website NetUp.
- Gợi ý sân/session dựa trên nhu cầu người dùng.

## Phạm vi sản phẩm
- Người chơi: tìm sân, xem map, đặt sân theo 2 mode, nhận QR.
- Chủ sân: dashboard, quản lý sân, check-in bằng booking code.
- Quản trị: cấu hình phí và rule vận hành.

## Giải thích tính năng chính
1. Booking mode
- Ghép lẻ (Nhóm A): tính theo slot + phí sàn.
- Bao sân (Nhóm B): tính trọn sân, phí sàn = 0.

2. Discovery map
- Cho phép chuyển giữa List và Map.
- Marker map hiển thị luôn số slot đã chiếm/tổng (ví dụ: 6/8).

3. Check-in
- Sau khi booking thành công có QR demo.
- Chủ sân check-in bằng booking code hoặc QR mock.

4. Admin config
- Platform fee
- Floor fee
- Matching radius
- No-show strike limit
- Auto-release minutes

5. Self-assessment
- Người chơi tự nhập tần suất chơi, kinh nghiệm, stamina, kỹ thuật, chiến thuật.
- Hệ thống phân cấp level để phục vụ recommendation.

## Rule gợi ý sân (demo)
- Ưu tiên đúng môn.
- Ưu tiên đúng level.
- Ưu tiên đúng khu vực.
- Ưu tiên đúng ngân sách.
- Ưu tiên session còn slot.

## Giới hạn
- Chatbot hiện là rule-based local demo.
- Chưa tích hợp LLM/API thật.
