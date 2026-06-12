import { Tooltip } from "antd";
import type { WeekRow } from "../hooks/useStreakData";
import styles from "./streak-calendar.module.css";

type Props = {
  weeks: WeekRow[];
  currentMonth: { year: number; month: number };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  loading: boolean;
};

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export const StreakCalendar = ({
  weeks,
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
  loading,
}: Props) => {
  const monthLabel = `${MONTH_NAMES[currentMonth.month - 1]} / ${currentMonth.year}`;

  return (
    <div>
      {/* Header: month name + navigation */}
      <div className={styles.calendarHeader}>
        <div className={styles.calendarTitle}>{monthLabel}</div>
        <div className={styles.calendarNav}>
          <button
            className={styles.navBtn}
            onClick={onPrevMonth}
            title="Previous month"
          >
            ‹
          </button>
          <button
            className={`${styles.navBtn} ${styles.todayBtn}`}
            onClick={onToday}
          >
            Today
          </button>
          <button
            className={styles.navBtn}
            onClick={onNextMonth}
            title="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className={styles.calendarGrid}>
        {/* Day of week headers */}
        {DAY_HEADERS.map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}

        {/* Calendar cells */}
        {weeks.map((week, weekIdx) =>
          week.map((day) => {
            const intensityClass =
              styles[`intensity${day.isCurrentMonth ? day.intensity : 0}` as keyof typeof styles];

            const tooltipContent = day.activity
              ? `${day.activity.reading} Reading, ${day.activity.listening} Listening`
              : null;

            const cell = (
              <div
                key={day.date}
                className={`
                  ${styles.dayCell}
                  ${day.isCurrentMonth ? styles.dayCurrentMonth : styles.dayOtherMonth}
                  ${intensityClass}
                  ${day.isToday ? styles.dayToday : ""}
                `}
                style={{ animationDelay: `${(weekIdx * 7 + week.indexOf(day)) * 0.02}s` }}
              >
                {day.dayOfMonth}
              </div>
            );

            if (tooltipContent && day.isCurrentMonth) {
              return (
                <Tooltip key={day.date} title={tooltipContent} placement="top">
                  {cell}
                </Tooltip>
              );
            }

            return cell;
          })
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span>Less</span>
        <div
          className={styles.legendBox}
          style={{ background: "var(--streak-0)" }}
        />
        <div
          className={styles.legendBox}
          style={{ background: "var(--streak-1)" }}
        />
        <div
          className={styles.legendBox}
          style={{ background: "var(--streak-2)" }}
        />
        <div
          className={styles.legendBox}
          style={{ background: "var(--streak-3)" }}
        />
        <span>More</span>
      </div>
    </div>
  );
};
