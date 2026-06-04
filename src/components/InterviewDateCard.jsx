import { getTodayStr } from "../utils/date.js";
import StatCard from "./StatCard.jsx";

export default function InterviewDateCard({ ddayLabel, editingDate, interviewDate, onEdit, onSave, onDateChange }) {
  return (
    <StatCard label="Interview Countdown" value={ddayLabel}>
      {editingDate ? (
        <form onSubmit={onSave} className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="date"
            value={interviewDate}
            min={getTodayStr()}
            onChange={(e) => onDateChange(e.target.value)}
            required
            className="min-w-0 w-full border-2 border-[var(--line)] rounded-xl text-foreground bg-card px-2.5 py-2 font-inherit"
          />
          <button
            type="submit"
            className="border-3 border-[var(--line)] rounded-[14px] bg-primary text-primary-foreground text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms] whitespace-nowrap"
          >
            Set
          </button>
        </form>
      ) : (
        <button
          onClick={onEdit}
          className="w-fit border-3 border-[var(--line)] rounded-[14px] bg-card text-foreground text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms]"
        >
          {interviewDate || "Choose interview date"}
        </button>
      )}
    </StatCard>
  );
}
