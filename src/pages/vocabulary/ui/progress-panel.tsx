/**
 * ProgressPanel — Vocabulary study analytics.
 *
 * Renders the streak, today's daily-goal progress, a 30-day words/day bar
 * chart, and the topic distribution. Fed entirely by `VocabProgress` from
 * services/vocabulary.getVocabularyProgress (no client fetching).
 */
import type { VocabProgress } from "~services/vocabulary";

const TOPIC_COLORS = [
  "#b3e653",
  "#5281f9",
  "#fc945a",
  "#f96b8b",
  "#169b86",
  "#7c6ef9",
];

export const ProgressPanel = ({ progress }: { progress: VocabProgress }) => {
  const { streak, todayCount, dailyGoal, perDay, topics } = progress;
  const goalPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));
  const topicTotal = Math.max(1, topics.reduce((s, t) => s + t.count, 0));

  return (
    <div className="flex flex-col gap-[16px]">
      <h2 className="font-display font-bold text-[18px] leading-normal text-[#191d24]">
        Your progress
      </h2>

      {/* Streak + daily goal */}
      <div className="flex gap-[20px] flex-col md:flex-row">
        {/* Streak */}
        <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex items-center gap-[16px] p-[22px] flex-1 min-w-0">
          <div className="flex items-center justify-center size-[52px] rounded-[16px] bg-[rgba(252,148,89,0.16)] shrink-0">
            <span className="material-symbols-rounded text-[28px] text-[#fc945a]">
              local_fire_department
            </span>
          </div>
          <div className="flex flex-col gap-[2px] min-w-0">
            <p className="font-display font-bold text-[26px] leading-none text-[#191d24]">
              {streak}
            </p>
            <p className="font-inter text-[13px] leading-normal text-[#6a7282]">
              day{streak !== 1 ? "s" : ""} streak
            </p>
          </div>
        </div>

        {/* Daily goal */}
        <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex flex-col gap-[10px] p-[22px] flex-[2] min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-inter font-semibold text-[14px] leading-normal text-[#191d24]">
              Daily goal
            </p>
            <p className="font-inter font-medium text-[13px] leading-normal text-[#6a7282]">
              {todayCount} / {dailyGoal} today
            </p>
          </div>
          <div className="h-[10px] rounded-full overflow-hidden bg-[#e5e6e8]">
            <div
              className="h-full bg-[#b3e653] rounded-full transition-[width] duration-300"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Words / day — 30-day bar chart */}
      <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex flex-col gap-[14px] p-[22px]">
        <div className="flex items-center justify-between">
          <p className="font-inter font-semibold text-[14px] leading-normal text-[#191d24]">
            Activity (last 30 days)
          </p>
          <span className="font-inter text-[12px] leading-normal text-[#6a7282]">
            adds + reviews
          </span>
        </div>
        <div className="flex items-end gap-[3px] h-[88px]">
          {perDay.map((d) => (
            <div
              key={d.date}
              className="flex-1 min-w-0 rounded-[3px] bg-[#b3e653] transition-[height]"
              style={{
                height: `${Math.max(4, (d.count / maxDay) * 100)}%`,
                opacity: d.count === 0 ? 0.18 : 1,
              }}
              title={`${d.date}: ${d.count}`}
            />
          ))}
        </div>
      </div>

      {/* Topic distribution */}
      {topics.length > 0 && (
        <div className="bg-white border border-[rgba(25,29,36,0.1)] rounded-[24px] flex flex-col gap-[12px] p-[22px]">
          <p className="font-inter font-semibold text-[14px] leading-normal text-[#191d24]">
            By topic
          </p>
          <div className="flex flex-col gap-[10px]">
            {topics.map((t, i) => (
              <div key={t.topic} className="flex flex-col gap-[4px]">
                <div className="flex items-center justify-between">
                  <span className="font-inter text-[13px] leading-normal text-[#191d24]">
                    {t.topic}
                  </span>
                  <span className="font-inter text-[12px] leading-normal text-[#6a7282]">
                    {t.count}
                  </span>
                </div>
                <div className="h-[8px] rounded-full overflow-hidden bg-[#f1f2ee]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(t.count / topicTotal) * 100}%`,
                      backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
