export default function TraitCard({ description, label, value }) {
  return (
    <article className="border-3 border-[var(--line)] rounded-[18px] bg-[var(--cream)] shadow-[5px_5px_0_var(--line)] p-4">
      <span className="text-muted-foreground text-[0.78rem] font-black uppercase">{label}</span>
      <strong className="block text-foreground text-[clamp(2rem,5vw,3.6rem)] font-black leading-[0.95]">{value}</strong>
      <p className="text-muted-foreground">{description}</p>
    </article>
  );
}
