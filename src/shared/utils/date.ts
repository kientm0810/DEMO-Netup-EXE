const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatSessionTime(isoTime: string): string {
  return dateTimeFormatter.format(new Date(isoTime));
}
