export default function StatCard({ children, label, value }) {
  return (
    <article className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 min-h-[178px] flex flex-col justify-between">
      <span className="text-muted-foreground text-[0.78rem] font-black uppercase">{label}</span>
      <strong className="block text-foreground text-[clamp(2rem,5vw,3.6rem)] font-black leading-[0.95]">{value}</strong>
      {children}
    </article>
  );
}
