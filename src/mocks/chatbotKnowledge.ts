export interface ChatbotKnowledgeItem {
  id: string;
  title: string;
  keywords: string[];
  answer: string;
}

export const chatbotKnowledge: ChatbotKnowledgeItem[] = [
  {
    id: "booking-toggle",
    title: "Booking mode",
    keywords: ["đặt trọn", "ghép kèo", "toggle", "nhóm a", "nhóm b"],
    answer:
      "NetUp có 2 mode: Đi một mình (Nhóm A) và Đặt trọn sân (Nhóm B). Mode Nhóm A tính giá suất chơi + floor fee. Mode Nhóm B bao trọn sân và floor fee về 0.",
  },
  {
    id: "checkin-qr",
    title: "Check-in bằng QR",
    keywords: ["qr", "check-in", "mã", "vào sân"],
    answer:
      "Sau khi booking thành công, hệ thống sinh QR demo để đưa cho quầy check-in. Owner có trang Check-in để nhập booking code hoặc quét mock QR.",
  },
  {
    id: "owner-dashboard",
    title: "Owner dashboard",
    keywords: ["owner", "dashboard", "doanh thu", "occupancy"],
    answer:
      "Owner dashboard hiển thị revenue hôm nay/tuần/tháng, occupancy, payout pending và recent bookings để theo dõi vận hành sân.",
  },
  {
    id: "admin-config",
    title: "Admin config",
    keywords: ["admin", "platform fee", "floor fee", "matching radius", "rule"],
    answer:
      "Admin có thể chỉnh platform fee, floor fee, matching radius, no-show strike limit và auto-release slot. Rule mới áp dụng ngay cho booking tạo sau đó.",
  },
  {
    id: "assessment",
    title: "Self assessment",
    keywords: ["đánh giá", "trình độ", "skill", "assessment"],
    answer:
      "Player có form Self Assessment để tự đánh giá tần suất chơi, kinh nghiệm, stamina, kỹ thuật và chiến thuật. Hệ thống phân cấp level để gợi ý session phù hợp.",
  },
  {
    id: "map-view",
    title: "Map view",
    keywords: ["map", "bản đồ", "vị trí", "địa điểm"],
    answer:
      "Trang Discovery có thể chuyển giữa chế độ List và Map. Map hiển thị vị trí sân theo dữ liệu mock và popup thông tin số session đang mở.",
  },
];

export const chatbotQuickPrompts = [
  "Giải thích sự khác nhau giữa ghép kèo và đặt trọn sân",
  "Owner check-in hoạt động thế nào?",
  "Admin có thể chỉnh các rule nào?",
  "Gợi ý cho tôi sân badminton ở Thu Duc dưới 130k",
];
