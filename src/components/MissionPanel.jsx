import { useNavigate } from "react-router-dom";
import { computeTopicStats } from "../utils/stats.js";
import { getLogs } from "../utils/storage.js";
import InterviewDateCard from "./InterviewDateCard.jsx";
import StatCard from "./StatCard.jsx";
import TrainingCard from "./TrainingCard.jsx";

export default function MissionPanel({
  ddayLabel, editingDate, interviewDate, solvedToday, streak, tip,
  todayCount, totalSolved, communityProblems, onCheckin, onDateChange, onEditDate, onSaveDate,
}) {
  const navigate = useNavigate();
  const topics = computeTopicStats();
  const top3Strong = topics.slice(0, 3);
  const top3Weak = [...topics].reverse().slice(0, 3);

  const reviewLogs = getLogs().filter(l => l.confidence <= 2 || (l.mistakeTags && l.mistakeTags.length > 0)).slice(0, 3);

  return (
    <section className="grid gap-[14px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
        {/* Recent Mistakes */}
        <div className="border-3 border-[var(--line)] rounded-[18px] bg-card text-foreground shadow-[5px_5px_0_var(--line)] p-4 flex flex-col">
          <h2 className="flex items-center gap-2 text-[0.85rem] font-black uppercase tracking-wide mb-3 text-[var(--berry-dark,#df3e66)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            Recent Mistakes
          </h2>
          {reviewLogs.length === 0 ? (
            <p className="text-sm font-bold opacity-80 mt-auto mb-auto">No recent mistakes found! Great job.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {reviewLogs.map(log => (
                <div key={log.id} className="flex flex-col border-2 border-[var(--line)] rounded-xl bg-muted/30 text-foreground p-2 px-3 shadow-[2px_2px_0_var(--line)]">
                  <div className="flex justify-between items-start gap-2">
                    <a href={`https://leetcode.com/problems/${log.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`} target="_blank" rel="noopener noreferrer" className="font-black hover:underline text-sm truncate">{log.title}</a>
                    <span className="text-[0.65rem] font-bold opacity-70 whitespace-nowrap">{log.date.slice(0, 10)}</span>
                  </div>
                  {log.mistakeTags && log.mistakeTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {log.mistakeTags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[0.6rem] font-black border border-[var(--line)] bg-[var(--berry,#ff6f8f)] text-[var(--line)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Pulse */}
        <div className="border-3 border-[var(--line)] rounded-[18px] bg-foreground text-background shadow-[5px_5px_0_var(--line)] p-4 flex flex-col">
          <h2 className="flex items-center gap-2 text-[0.85rem] font-black uppercase tracking-wide mb-3 text-[var(--leaf,#5dd39e)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Community Pulse
          </h2>
          {(!communityProblems || communityProblems.length === 0) ? (
            <p className="text-sm font-bold opacity-80 mt-auto mb-auto">No recent activity.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {communityProblems.map(prob => (
                <div key={prob.id} className="flex flex-col border-2 border-background/20 rounded-xl bg-background/5 p-2 px-3">
                  <p className="text-sm font-black truncate">{prob.title}</p>
                  <p className="text-[0.65rem] font-bold opacity-70">
                    Solved by <span className="text-[var(--primary,#ffd55a)]">{prob.username}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px]">
        <StatCard label="Problems Solved" value={totalSolved}>
          <p className="text-muted-foreground">Keep grinding!</p>
        </StatCard>
        <StatCard label="Current Streak" value={streak}>
          <p className="text-muted-foreground">{streak === 1 ? "day" : "days"}</p>
        </StatCard>
        <InterviewDateCard
          ddayLabel={ddayLabel}
          editingDate={editingDate}
          interviewDate={interviewDate}
          onDateChange={onDateChange}
          onEdit={onEditDate}
          onSave={onSaveDate}
        />
      </div>

      <TrainingCard solvedToday={solvedToday} todayCount={todayCount} onCheckin={onCheckin} />

      {/* Mini stats panel */}
      {topics.length > 0 && (
        <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[0.76rem] font-black uppercase text-[#5dd39e] mb-2">💪 Strongest</p>
            <ul className="flex flex-col gap-1">
              {top3Strong.map(t => (
                <li key={t.name} className="flex justify-between text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground">{t.count}×</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.76rem] font-black uppercase text-[#e06557] mb-2">🔥 Needs Work</p>
            <ul className="flex flex-col gap-1">
              {top3Weak.map(t => (
                <li key={t.name} className="flex justify-between text-sm">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted-foreground">{t.count}×</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => navigate("/stats")}
            className="sm:col-span-2 w-fit border-3 border-[var(--line)] rounded-[14px] bg-card text-foreground text-[0.82rem] font-black px-[14px] py-2 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms]"
          >
            View full stats →
          </button>
        </div>
      )}

      <section className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4">
        <p className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)] mb-1.5">Coach Tip</p>
        <p className="text-muted-foreground">{tip}</p>
      </section>
    </section>
  );
}
