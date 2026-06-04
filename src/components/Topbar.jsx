export default function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 mb-5">
      <div>
        <p className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)]">
          Coding Interview Tracker
        </p>
        <h1 className="text-[clamp(2.25rem,7vw,4.9rem)] font-black leading-[0.92] mt-0.5">
          Algo-Itseo
        </h1>
      </div>
      <div className="border-3 border-[var(--line)] rounded-full bg-primary text-primary-foreground text-[0.82rem] font-black px-[14px] py-[9px] whitespace-nowrap shadow-[4px_4px_0_var(--line)]">
        Saved locally
      </div>
    </header>
  );
}
