export interface ChatbotKnowledgeItem {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
}

export const chatbotKnowledge: ChatbotKnowledgeItem[] = [
  {
    id: "booking-toggle",
    title: "Chế độ đặt sân",
    keywords: ["đặt trọn", "ghép kèo", "chế độ", "nhóm a", "nhóm b"],
    answer:
      "NetUp có 2 mode: Đi một mình (Nhóm A) và Đặt trọn sân (Nhóm B). Nhóm A tính giá suất chơi + phí sàn. Nhóm B bao trọn sân và phí sàn về 0.",
  },
  {
    id: "checkin-qr",
    title: "Check-in bằng QR",
    keywords: ["qr", "check-in", "mã", "vào sân"],
    answer:
      "Sau khi booking thành công, hệ thống sinh QR demo để đưa cho quầy check-in. Chủ sân có trang Check-in để nhập mã booking hoặc quét QR mock.",
  },
  {
    id: "owner-dashboard",
    title: "Bảng điều khiển chủ sân",
    keywords: ["chủ sân", "bảng điều khiển", "doanh thu", "tỷ lệ lấp đầy"],
    answer:
      "Bảng điều khiển chủ sân hiển thị doanh thu theo ngày/tuần/tháng, tỷ lệ lấp đầy, số dư chờ rút và lượt đặt mới gần đây.",
  },
  {
    id: "admin-config",
    title: "Cấu hình quản trị",
    keywords: ["admin", "phí nền tảng", "phí sàn", "bán kính ghép kèo", "quy tắc"],
    answer:
      "Quản trị có thể chỉnh phí nền tảng, phí sàn, bán kính ghép kèo, ngưỡng no-show và thời gian tự nhả slot. Cấu hình mới áp dụng cho lượt đặt tạo sau đó.",
  },
  {
    id: "assessment",
    title: "Tự đánh giá năng lực",
    keywords: ["đánh giá", "trình độ", "kỹ năng", "năng lực"],
    answer:
      "Người chơi có form tự đánh giá để nhập tần suất chơi, kinh nghiệm, thể lực, kỹ thuật và chiến thuật. Hệ thống phân cấp level để gợi ý session phù hợp.",
  },
  {
    id: "map-view",
    title: "Xem trên bản đồ",
    keywords: ["map", "bản đồ", "vị trí", "địa điểm", "slot"],
    answer:
      "Trang khám phá có thể chuyển giữa danh sách và bản đồ. Marker trên map hiển thị trực tiếp số slot đã chiếm (ví dụ: 6/8) để nhìn nhanh tình trạng sân.",
  },
];

export const chatbotQuickPrompts = [
  "Giải thích sự khác nhau giữa ghép kèo và đặt trọn sân",
  "Check-in bằng QR hoạt động như thế nào?",
  "Quản trị có thể chỉnh các quy tắc nào?",
  "Gợi ý cho tôi sân cầu lông ở Thu Duc dưới 130k",
];
