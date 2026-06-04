import { useNavigate } from "react-router-dom";

export default function TrainingCard({ solvedToday, todayCount, onCheckin }) {
  const navigate = useNavigate();

  return (
    <section
      id="checkin"
      className="border-3 border-[var(--line)] rounded-[18px] shadow-[5px_5px_0_var(--line)] p-4 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: "linear-gradient(135deg,#ffffff 0%,#e7fff5 100%)" }}
    >
      <div>
        <p className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)]">Today's Work</p>
        <h2 className="text-[clamp(1.5rem,3vw,2.1rem)] font-black leading-[1.05]">
          {todayCount > 0 ? `${todayCount} problem${todayCount > 1 ? "s" : ""} logged` : "Nothing logged yet"}
        </h2>
        <p className="text-muted-foreground">
          {solvedToday ? "Streak secured. Keep going!" : "Log a problem to secure today's streak."}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => navigate("/log")}
          className="border-3 border-[var(--line)] rounded-[14px] bg-[var(--leaf,#5dd39e)] text-foreground text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms] whitespace-nowrap"
        >
          + Log Problem
        </button>
        <button
          className={`border-3 border-[var(--line)] rounded-[14px] text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms] whitespace-nowrap
            ${solvedToday ? "bg-[#dbe3ef] text-muted-foreground cursor-default" : "bg-primary text-primary-foreground hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)]"}`}
          onClick={onCheckin}
          disabled={solvedToday}
        >
          {solvedToday ? "✓ Streak Logged" : "Mark Streak"}
        </button>
      </div>
    </section>
  );
}
