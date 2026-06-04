export default function MeterCard({ label, value, progress }) {
  return (
    <article className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4">
      <div className="flex justify-between gap-[14px] mb-2.5">
        <span className="text-muted-foreground text-[0.78rem] font-black uppercase">{label}</span>
        <strong className="font-black">{value}</strong>
      </div>
      <div className="h-5 overflow-hidden border-3 border-[var(--line)] rounded-full bg-[#eff3f8]">
        <span
          className="block h-full min-w-2 border-r-3 border-[var(--line)]"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--leaf,#5dd39e) 0%, var(--spark,#ffd55a) 100%)",
          }}
        />
      </div>
    </article>
  );
}
