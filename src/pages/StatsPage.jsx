import { getLogs } from "../utils/storage.js";
import { computeConfidenceBreakdown, computeDifficultyBreakdown, computeTopicStats, computeRadarStats, computeMistakeStats } from "../utils/stats.js";
import { FaceConfident, FaceLost, FaceNeutral } from "../components/ConfidenceFaces.jsx";
import RadarChart from "../components/RadarChart.jsx";

const CONFIDENCE_FACES = [FaceLost, FaceNeutral, FaceConfident];

const DIFF_COLOR = { Easy: "#5dd39e", Medium: "#ffd55a", Hard: "#e06557" };

function DiffBadge({ e, m, h }) {
  const tooltip = [
    e > 0 ? `${e} Easy` : null,
    m > 0 ? `${m} Medium` : null,
    h > 0 ? `${h} Hard` : null
  ].filter(Boolean).join(", ") + " problems solved";

  return (
    <div title={tooltip} className="flex gap-1.5 text-[0.65rem] font-black uppercase tracking-wide bg-[var(--background)] px-1.5 py-0.5 rounded items-center border border-[var(--border)] cursor-help">
      {e > 0 && <span className="text-[#5dd39e]">{e}E</span>}
      {m > 0 && <span className="text-[#ffd55a]">{m}M</span>}
      {h > 0 && <span className="text-[#e06557]">{h}H</span>}
      {e === 0 && m === 0 && h === 0 && <span className="text-muted-foreground">-</span>}
    </div>
  );
}

export default function StatsPage() {
  const logs = getLogs();
  const topics = computeTopicStats();
  const diff = computeDifficultyBreakdown();
  const conf = computeConfidenceBreakdown();
  const mistakes = computeMistakeStats();
  const total = logs.length;

  // Radar: normalize raw scores to 0-100 for the chart.
  // Baseline is 100 XP so it doesn't max out immediately.
  const radarRaw = computeRadarStats();
  const BASELINE = 100;
  const radarMax = Math.max(...radarRaw.map(d => d.score), BASELINE);
  const radarData = radarRaw.map(d => ({ name: d.name, score: Math.round((d.score / radarMax) * 100) }));

  // XP System: 100+ Strong, 40-99 Building, < 40 Needs Work
  const strong = topics.filter(t => t.score >= 100);
  const mid = topics.filter(t => t.score >= 40 && t.score < 100);
  const weak = topics.filter(t => t.score < 40);

  if (total === 0) {
    return (
      <div className="grid gap-[14px]">
        <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.95]">Stats</h2>
        <p className="text-muted-foreground text-center py-16">Log some problems first to see your stats.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-[14px]">
      <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.95]">Stats</h2>

      {/* Overview row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[14px]">
        {[
          { label: "Total Solved", value: total },
          { label: "Easy", value: diff.Easy, color: "#5dd39e" },
          { label: "Medium", value: diff.Medium, color: "#ffd55a" },
          { label: "Hard", value: diff.Hard, color: "#e06557" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4">
            <span className="text-[0.76rem] font-black uppercase text-muted-foreground">{label}</span>
            <strong className="block text-[2.5rem] font-black leading-[0.95]" style={color ? { color } : {}}>{value}</strong>
          </div>
        ))}
      </div>

      {/* Confidence breakdown */}
      <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col gap-3">
        <p className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)]">Confidence Breakdown</p>
        <div className="flex gap-6 justify-around flex-wrap">
          {[1, 2, 3].map(v => {
            const Face = CONFIDENCE_FACES[v - 1];
            return (
            <div key={v} className="flex flex-col items-center gap-1">
              <Face size={56} />
              <span className="font-black text-2xl">{conf[v] ?? 0}</span>
              <span className="text-muted-foreground text-xs">{["Lost", "Getting there", "Confident"][v - 1]}</span>
            </div>
          )})}
        </div>
      </div>

      {/* Common Mistakes */}
      {mistakes.length > 0 && (
        <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col gap-3">
          <p className="text-[0.76rem] font-black uppercase text-muted-foreground">Common Mistakes</p>
          <div className="flex gap-2 flex-wrap">
            {mistakes.map(m => (
              <div key={m.name} className="flex items-center gap-2 text-[var(--accent)] bg-background px-3 py-1.5 rounded-lg border-2 border-[var(--accent)]">
                <span className="font-bold text-sm">{m.name}</span>
                <span className="bg-[var(--accent)] text-accent-foreground text-[0.65rem] font-black px-1.5 py-0.5 rounded-md">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Radar chart */}
      <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col items-center gap-3">
        <p className="self-start text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)]">Topic Radar</p>
        <RadarChart data={radarData} size={340} />
      </div>

      {/* Topic strength */}
      <div className="grid sm:grid-cols-3 gap-[14px]">
        {[
          { title: "💪 Strong", items: strong },
          { title: "📈 Building", items: mid },
          { title: "🔥 Needs Work", items: weak },
        ].map(({ title, items }) => (
          <div key={title} className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col gap-3">
            <p className="text-[0.76rem] font-black uppercase text-muted-foreground flex justify-between">
              <span>{title}</span>
              <span className="opacity-50 text-[0.65rem]">{items.length}</span>
            </p>
            {items.length === 0
              ? <p className="text-muted-foreground text-sm">None yet</p>
              : items.map(t => (
                <div key={t.name} className="flex flex-col gap-1.5 p-2 -mx-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm truncate pr-2">{t.name}</span>
                    <span className="text-[0.7rem] font-black shrink-0">{t.score} XP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <DiffBadge e={t.e} m={t.m} h={t.h} />
                    <span className="text-muted-foreground text-[0.65rem] font-bold uppercase tracking-wide">
                      {["", "Lost", "Getting there", "Confident"][Math.round(t.avgConf)]}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        ))}
      </div>

      {/* Full topic table */}
      {topics.length > 0 && (
        <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col gap-2">
          <p className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)] mb-1">All Topics</p>
          {topics.map(t => (
            <div key={t.name} className="flex items-center gap-3 p-1.5 -mx-1.5 hover:bg-[var(--muted)] rounded-lg transition-colors">
              <span className="w-32 sm:w-40 shrink-0 text-sm font-semibold truncate">{t.name}</span>
              <DiffBadge e={t.e} m={t.m} h={t.h} />
              <div className="flex-1 flex justify-end gap-3 items-center">
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground hidden sm:block">
                  {["", "Lost", "Getting there", "Confident"][Math.round(t.avgConf)]}
                </span>
                <span className="text-[0.8rem] font-black w-12 text-right">{t.score} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
