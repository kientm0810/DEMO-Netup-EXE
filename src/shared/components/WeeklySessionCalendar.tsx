import { useMemo } from "react";
import type { Court, Session } from "../../entities";
import { cn } from "../utils";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 22;
const HOUR_HEIGHT = 40;

const sportColorClass: Record<Court["sport"], string> = {
  Badminton: "border-emerald-300 bg-emerald-50 text-emerald-900",
  Football: "border-sky-300 bg-sky-50 text-sky-900",
  Tennis: "border-amber-300 bg-amber-50 text-amber-900",
};

export interface WeeklySessionCalendarItem {
  session: Session;
  court: Court;
  isPromoted?: boolean;
  tags?: string[];
}

interface PositionedCalendarItem extends WeeklySessionCalendarItem {
  dayIndex: number;
  startDecimal: number;
  endDecimal: number;
  lane: number;
  laneCount: number;
  top: number;
  height: number;
}

interface WeeklySessionCalendarProps {
  items: WeeklySessionCalendarItem[];
  selectedSessionId?: string;
  anchorDate?: string | Date;
  onSlotClick?: (item: WeeklySessionCalendarItem) => void;
  emptyMessage?: string;
  className?: string;
  colorMode?: "sport" | "promotion";
}

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function getStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getStartOfWeek(date: Date): Date {
  const startOfDay = getStartOfDay(date);
  const day = (startOfDay.getDay() + 6) % 7;
  startOfDay.setDate(startOfDay.getDate() - day);
  return startOfDay;
}

function formatHourLabel(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function formatSessionRange(startsAt: string, durationMinutes: number): string {
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const startText = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const endText = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${startText} - ${endText}`;
}

function getSlotClassName(params: {
  isSelected: boolean;
  item: WeeklySessionCalendarItem;
  colorMode: "sport" | "promotion";
}): string {
  if (params.isSelected) {
    return "border-red-400 bg-red-100 text-red-900 ring-2 ring-red-200";
  }

  if (params.colorMode === "promotion") {
    return params.item.isPromoted
      ? "border-emerald-400 bg-emerald-100 text-emerald-900"
      : "border-slate-300 bg-slate-100 text-slate-700";
  }

  return sportColorClass[params.item.court.sport];
}

export function WeeklySessionCalendar({
  items,
  selectedSessionId,
  anchorDate,
  onSlotClick,
  emptyMessage = "Chưa có khung giờ trong tuần này.",
  className,
  colorMode = "sport",
}: WeeklySessionCalendarProps) {
  const resolvedAnchorDate = useMemo(() => {
    if (anchorDate) {
      return toDate(anchorDate);
    }

    const selectedItem = selectedSessionId
      ? items.find((item) => item.session.id === selectedSessionId)
      : undefined;
    if (selectedItem) {
      return new Date(selectedItem.session.startsAt);
    }

    if (items.length > 0) {
      return new Date(items[0].session.startsAt);
    }

    return new Date();
  }, [anchorDate, items, selectedSessionId]);

  const weekStart = useMemo(() => getStartOfWeek(resolvedAnchorDate), [resolvedAnchorDate]);
  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 7 * DAY_MS), [weekStart]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => new Date(weekStart.getTime() + index * DAY_MS)),
    [weekStart],
  );

  const weekItems = useMemo(() => {
    return items
      .map((item) => {
        const startDate = new Date(item.session.startsAt);
        const endDate = new Date(startDate.getTime() + item.session.durationMinutes * 60_000);
        return { item, startDate, endDate };
      })
      .filter(({ startDate }) => startDate >= weekStart && startDate < weekEnd);
  }, [items, weekEnd, weekStart]);

  const { startHour, endHour } = useMemo(() => {
    if (weekItems.length === 0) {
      return { startHour: DEFAULT_START_HOUR, endHour: DEFAULT_END_HOUR };
    }

    const starts = weekItems.map(({ startDate }) => startDate.getHours() + startDate.getMinutes() / 60);
    const ends = weekItems.map(({ endDate }) => endDate.getHours() + endDate.getMinutes() / 60);
    const minHour = Math.max(0, Math.floor(Math.min(...starts)) - 1);
    const maxHour = Math.min(24, Math.ceil(Math.max(...ends)) + 1);
    const rawRange = Math.max(8, maxHour - minHour);
    const safeEnd = Math.min(24, minHour + rawRange);
    return { startHour: minHour, endHour: safeEnd };
  }, [weekItems]);

  const totalHours = Math.max(1, endHour - startHour);
  const calendarHeight = totalHours * HOUR_HEIGHT;

  const positionedByDay = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => [] as PositionedCalendarItem[]);

    for (const { item, startDate, endDate } of weekItems) {
      const dayStart = getStartOfDay(startDate);
      const dayIndex = Math.floor((dayStart.getTime() - weekStart.getTime()) / DAY_MS);
      if (dayIndex < 0 || dayIndex > 6) {
        continue;
      }

      const startDecimal = startDate.getHours() + startDate.getMinutes() / 60;
      const endDecimal = endDate.getHours() + endDate.getMinutes() / 60;
      const top = (startDecimal - startHour) * HOUR_HEIGHT;
      const height = Math.max((endDecimal - startDecimal) * HOUR_HEIGHT, 32);

      buckets[dayIndex].push({
        ...item,
        dayIndex,
        startDecimal,
        endDecimal,
        lane: 0,
        laneCount: 1,
        top,
        height,
      });
    }

    return buckets.map((dayItems) => {
      const sorted = dayItems.sort((a, b) => a.startDecimal - b.startDecimal);
      const laneEnds: number[] = [];

      for (const entry of sorted) {
        const laneIndex = laneEnds.findIndex((laneEnd) => entry.startDecimal >= laneEnd);
        if (laneIndex >= 0) {
          entry.lane = laneIndex;
          laneEnds[laneIndex] = entry.endDecimal;
        } else {
          entry.lane = laneEnds.length;
          laneEnds.push(entry.endDecimal);
        }
      }

      const laneCount = Math.max(1, laneEnds.length);
      for (const entry of sorted) {
        entry.laneCount = laneCount;
      }

      return sorted;
    });
  }, [startHour, weekItems, weekStart]);

  const hourMarks = useMemo(
    () => Array.from({ length: totalHours + 1 }, (_, index) => startHour + index),
    [startHour, totalHours],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[62px_repeat(7,minmax(110px,1fr))] border-b border-slate-200">
            <div className="bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-500">Giờ</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="border-l border-slate-200 bg-slate-50 px-2 py-2 text-xs">
                <p className="font-semibold text-slate-700">
                  {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                </p>
                <p className="text-slate-500">{day.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[62px_repeat(7,minmax(110px,1fr))]">
            <div className="relative border-r border-slate-200 bg-white" style={{ height: `${calendarHeight}px` }}>
              {hourMarks.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                  style={{ top: `${(hour - startHour) * HOUR_HEIGHT}px` }}
                >
                  <span className="-translate-y-1/2 bg-white px-1 text-[10px] text-slate-500">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              ))}
            </div>

            {weekDays.map((day, dayIndex) => {
              const dayItems = positionedByDay[dayIndex];
              return (
                <div
                  key={`${day.toISOString()}-calendar`}
                  className="relative border-r border-slate-200 bg-white last:border-r-0"
                  style={{ height: `${calendarHeight}px` }}
                >
                  {hourMarks.map((hour) => (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                      style={{ top: `${(hour - startHour) * HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {dayItems.map((item) => {
                    const laneWidth = 100 / item.laneCount;
                    const leftPercent = laneWidth * item.lane;
                    const isSelected = item.session.id === selectedSessionId;
                    const slotLabel = `${item.session.openSlots}/${item.session.maxSlots} slot`;
                    const tooltip = `${item.court.subCourtName} (${item.court.complexName}) • ${item.court.address}`;
                    const slotClassName = getSlotClassName({ isSelected, item, colorMode });

                    const sharedProps = {
                      title: `${tooltip}\n${item.court.subCourtName}\n${formatSessionRange(
                        item.session.startsAt,
                        item.session.durationMinutes,
                      )}\n${slotLabel}${item.tags && item.tags.length > 0 ? `\nTag: ${item.tags.join(", ")}` : ""}`,
                      className: cn(
                        "group absolute overflow-hidden rounded-lg border px-2 py-1 text-left text-[11px] shadow-sm transition",
                        slotClassName,
                        onSlotClick ? "cursor-pointer hover:shadow-md" : "",
                        isSelected ? "z-20" : "z-10",
                      ),
                      style: {
                        top: `${item.top}px`,
                        left: `calc(${leftPercent}% + 3px)`,
                        width: `calc(${laneWidth}% - 6px)`,
                        height: `${item.height}px`,
                      },
                    };

                    if (onSlotClick) {
                      return (
                        <button
                          key={item.session.id}
                          type="button"
                          {...sharedProps}
                          onClick={() => onSlotClick(item)}
                        >
                          <p className="truncate font-semibold">
                            {formatSessionRange(item.session.startsAt, item.session.durationMinutes)}
                          </p>
                          <p className="truncate">{item.court.subCourtName}</p>
                          <p className="font-semibold">{slotLabel}</p>
                          {item.tags && item.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={`${item.session.id}-${tag}`}
                                  className="rounded-full bg-white/75 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : null}
                          <p className="truncate text-[10px] font-semibold">
                            Bấm để thao tác slot
                          </p>
                        </button>
                      );
                    }

                    return (
                      <div key={item.session.id} {...sharedProps}>
                        <p className="truncate font-semibold">
                          {formatSessionRange(item.session.startsAt, item.session.durationMinutes)}
                        </p>
                        <p className="truncate">{item.court.subCourtName}</p>
                        <p className="truncate">{slotLabel}</p>
                        {item.tags && item.tags.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={`${item.session.id}-readonly-${tag}`}
                                className="rounded-full bg-white/75 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {weekItems.length === 0 ? <p className="text-sm text-slate-500">{emptyMessage}</p> : null}
      <p className="text-xs text-slate-500">
        Di chuột vào từng slot để xem nhanh tên sân và địa chỉ chi tiết.
      </p>
    </div>
  );
}
