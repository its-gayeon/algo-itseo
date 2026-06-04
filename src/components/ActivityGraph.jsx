import React from "react";

export default function ActivityGraph({ activityDates }) {
  // activityDates is an array of "YYYY-MM-DD"
  // We only want the last 7 days (including today)
  
  const days = [];
  let checkTime = Date.now();
  for (let i = 0; i < 7; i++) {
    days.unshift(new Date(checkTime).toISOString().slice(0, 10));
    checkTime -= 86400000;
  }

  // Count problems solved per date
  const counts = {};
  for (const date of activityDates) {
    counts[date] = (counts[date] || 0) + 1;
  }

  return (
    <div className="flex gap-1.5 mt-2">
      {days.map((day) => {
        const count = counts[day] || 0;
        let colorClass = "bg-muted border-[var(--border)]";
        if (count === 1) colorClass = "bg-[var(--leaf,#5dd39e)] border-[var(--leaf,#5dd39e)]";
        if (count > 1) colorClass = "bg-[var(--leaf-dark,#24a06d)] border-[var(--leaf-dark,#24a06d)]";
        
        return (
          <div key={day} className="group relative flex justify-center">
            <div className={`w-4 h-4 rounded-sm border ${colorClass} transition-colors cursor-help`} />
            <div className="absolute bottom-full mb-1.5 px-2 py-1 bg-foreground text-background text-[0.65rem] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity shadow-lg">
              {count} problem{count === 1 ? '' : 's'} on {day}
            </div>
          </div>
        );
      })}
    </div>
  );
}
