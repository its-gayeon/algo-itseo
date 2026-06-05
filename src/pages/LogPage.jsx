import { useState } from "react";
import { FaceConfident, FaceLost, FaceNeutral } from "../components/ConfidenceFaces.jsx";
import { addLog, deleteLog, getLogs, updateLog } from "../utils/storage.js";
import { TAG_TO_AXIS } from "../utils/stats.js";

const DIFFICULTY_COLOR = {
  Easy: "text-[#5dd39e]",
  Medium: "text-[#ffd55a]",
  Hard: "text-[#e06557]",
  "Level 0": "text-[#a5b4fc]",
  "Level 1": "text-[#818cf8]",
  "Level 2": "text-[#6366f1]",
  "Level 3": "text-[#4f46e5]",
  "Level 4": "text-[#4338ca]",
  "Level 5": "text-[#3730a3]",
};

const CONFIDENCE = [
  { value: 1, label: "Lost", Face: FaceLost },
  { value: 2, label: "Getting there", Face: FaceNeutral },
  { value: 3, label: "Confident", Face: FaceConfident },
];

const MISTAKE_TYPES = [
  "Logic Flaw", "Edge Case", "Time Limit", "Memory Limit", "Syntax", "Misread", "Forgot Pattern"
];

function getPlatformInfo(url) {
  if (url.includes("leetcode.com/problems/")) {
    const m = url.match(/leetcode\.com\/problems\/([^/?#]+)/);
    return m ? { platform: "LeetCode", slug: m[1] } : null;
  } else if (url.includes("school.programmers.co.kr/")) {
    return { platform: "Programmers", url };
  }
  return null;
}

async function fetchProblem(slug) {
  const res = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${slug}`);
  if (!res.ok) throw new Error("Not found");
  const q = await res.json();
  if (!q.questionTitle) throw new Error("Problem not found");
  return {
    title: q.questionTitle,
    difficulty: q.difficulty,
    tags: (q.topicTags || []).map(t => t.name),
    slug,
    url: `https://leetcode.com/problems/${slug}/`,
  };
}

export default function LogPage({ token }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pending, setPending] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [notes, setNotes] = useState("");
  const [selectedMistakes, setSelectedMistakes] = useState([]);
  const [selectedPendingTags, setSelectedPendingTags] = useState([]);
  const [logs, setLogs] = useState(() => getLogs());
  const [programmersLevel, setProgrammersLevel] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  const [editMistakes, setEditMistakes] = useState([]);

  function handleSaveEdit(id) {
    const updated = updateLog(id, { notes: editNotes, mistakeTags: editMistakes });
    setLogs(updated);
    setEditingId(null);
  }

  async function handleFetch(e) {
    e.preventDefault();
    const cleanUrl = url.trim();
    const info = getPlatformInfo(cleanUrl);
    if (!info) { setErrorMsg("Paste a valid LeetCode or Programmers URL."); setStatus("error"); return; }
    setStatus("loading");
    setErrorMsg("");
    try {
      let problem;
      if (info.platform === "LeetCode") {
        problem = await fetchProblem(info.slug);
        problem.platform = "LeetCode";
      } else {
        const res = await fetch(`/api/proxy-programmers?url=${encodeURIComponent(info.url)}`);
        if (!res.ok) throw new Error("Not found");
        problem = await res.json();
      }
      setPending(problem);
      setConfidence(null);
      setNotes("");
      setSelectedMistakes([]);
      setSelectedPendingTags([]);
      setProgrammersLevel(null);
      setStatus("confirming");
    } catch {
      setErrorMsg("Couldn't fetch problem. Check the URL and try again.");
      setStatus("error");
    }
  }

  async function handleLog() {
    if (!confidence) return;
    if (pending.platform === "Programmers" && !programmersLevel) return;
    
    const finalDifficulty = pending.platform === "Programmers" ? programmersLevel : pending.difficulty;
    const axes = [...new Set(selectedPendingTags.map(t => TAG_TO_AXIS[t]).filter(Boolean))];
    const updated = addLog({ ...pending, difficulty: finalDifficulty, confidence, notes, mistakeTags: selectedMistakes, mainThemes: axes, selectedTags: selectedPendingTags });
    setLogs(updated);

    if (token) {
      try {
        await fetch("/api/solved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            title: pending.title,
            difficulty: finalDifficulty,
            url: pending.url,
            date: new Date().toISOString().slice(0, 10)
          })
        });
      } catch (err) {
        console.error("Failed to share solved problem:", err);
      }
    }

    setPending(null);
    setConfidence(null);
    setNotes("");
    setSelectedMistakes([]);
    setSelectedPendingTags([]);
    setProgrammersLevel(null);
    setUrl("");
    setStatus(null);
  }

  function handleCancel() {
    setPending(null);
    setConfidence(null);
    setNotes("");
    setSelectedMistakes([]);
    setSelectedPendingTags([]);
    setProgrammersLevel(null);
    setStatus(null);
  }

  const [confirmId, setConfirmId] = useState(null);

  async function handleDelete(id) {
    const entry = logs.find(l => l.id === id);
    setLogs(deleteLog(id));
    setConfirmId(null);

    if (token && entry) {
      try {
        await fetch("/api/solved", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            title: entry.title,
            date: entry.date.slice(0, 10)
          })
        });
      } catch (err) {
        console.error("Failed to delete problem from community:", err);
      }
    }
  }

  return (
    <div className="grid gap-[14px]">
      <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-[0.95]">Log</h2>

      {status !== "confirming" && (
        <form onSubmit={handleFetch} className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col gap-3">
          <label className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)]">LeetCode / Programmers URL</label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://leetcode.com/problems/... or https://school.programmers.co.kr/..."
              required
              className="flex-1 min-w-0 border-2 border-[var(--line)] rounded-xl text-foreground bg-background px-3 py-2"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="border-3 border-[var(--line)] rounded-[14px] bg-primary text-primary-foreground text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Fetching…" : "Fetch Problem"}
            </button>
          </div>
          {status === "error" && <p className="text-[var(--accent)] text-sm font-semibold">{errorMsg}</p>}
        </form>
      )}

      {status === "confirming" && pending && (
        <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-5 flex flex-col gap-4">
          <div>
            <p className="text-[0.76rem] font-black uppercase text-[var(--berry-dark,#df3e66)]">How did it go?</p>
            <h3 className="font-black text-xl">{pending.title}</h3>
            <div className="flex gap-2 items-center mt-1 flex-wrap">
              {pending.platform === "Programmers" ? (
                <select
                  value={programmersLevel || ""}
                  onChange={e => setProgrammersLevel(e.target.value)}
                  className={`font-black text-sm outline-none bg-transparent cursor-pointer border-b-2 border-dashed border-[var(--border)] pb-0.5 ${programmersLevel ? DIFFICULTY_COLOR[programmersLevel] : "text-muted-foreground"}`}
                >
                  <option value="" disabled>Select Level</option>
                  {[0, 1, 2, 3, 4, 5].map(lvl => (
                    <option key={lvl} value={`Level ${lvl}`}>Level {lvl}</option>
                  ))}
                </select>
              ) : (
                <span className={`font-black text-sm ${DIFFICULTY_COLOR[pending.difficulty] ?? ""}`}>{pending.difficulty}</span>
              )}
              {pending.tags.map(t => (
                <span key={t} className="text-[0.72rem] font-bold px-2 py-0.5 rounded-full bg-muted border border-[var(--border)]">{t}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            {CONFIDENCE.map(({ value, label, Face }) => (
              <button
                key={value}
                type="button"
                onClick={() => setConfidence(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-3 transition-all duration-150
                  ${confidence === value
                    ? "border-[var(--line)] shadow-[3px_3px_0_var(--line)] scale-105 bg-primary"
                    : "border-transparent hover:border-[var(--border)] bg-muted"}`}
              >
                <Face size={56} />
                <span className="text-[0.72rem] font-black">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.76rem] font-black uppercase text-muted-foreground mt-2">Topics (Select up to 2)</label>
            <div className="flex flex-wrap gap-2 items-center">
              {pending.tags.map(t => {
                const active = selectedPendingTags.includes(t);
                const maxed = !active && selectedPendingTags.length >= 2;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={maxed}
                    onClick={() => {
                      if (active) setSelectedPendingTags(selectedPendingTags.filter(x => x !== t));
                      else setSelectedPendingTags([...selectedPendingTags, t]);
                    }}
                    className={`text-[0.72rem] font-bold px-2 py-1 rounded-full border-2 transition-all duration-150
                      ${active
                        ? "border-[var(--line)] bg-primary text-primary-foreground shadow-[2px_2px_0_var(--line)]"
                        : "border-[var(--border)] bg-background text-muted-foreground hover:border-[var(--line)]"}
                      ${maxed ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    {t}
                  </button>
                );
              })}
              
              <select
                value=""
                onChange={(e) => {
                  const newTag = e.target.value;
                  if (!newTag || pending.tags.includes(newTag)) return;
                  setPending(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
                  if (selectedPendingTags.length < 2) {
                    setSelectedPendingTags(prev => [...prev, newTag]);
                  }
                }}
                className="text-[0.72rem] font-bold py-1 px-3 appearance-none rounded-full border-2 border-dashed border-[var(--border)] bg-transparent text-muted-foreground hover:border-[var(--line)] hover:text-foreground cursor-pointer outline-none"
              >
                <option value="" disabled>+ Add Topic</option>
                {Object.keys(TAG_TO_AXIS)
                  .filter(t => !pending.tags.includes(t))
                  .sort()
                  .map(t => <option key={t} value={t}>{t}</option>)
                }
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.76rem] font-black uppercase text-muted-foreground mt-2">Any Mistakes?</label>
            <div className="flex flex-wrap gap-2">
              {MISTAKE_TYPES.map(m => {
                const active = selectedMistakes.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      if (active) setSelectedMistakes(selectedMistakes.filter(x => x !== m));
                      else setSelectedMistakes([...selectedMistakes, m]);
                    }}
                    className={`text-[0.72rem] font-bold px-2 py-1 rounded-full border-2 transition-all duration-150
                      ${active
                        ? "border-[var(--accent)] bg-background text-[var(--accent)] shadow-[2px_2px_0_var(--accent)]"
                        : "border-[var(--border)] bg-background text-muted-foreground hover:border-[var(--line)]"}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.76rem] font-black uppercase text-muted-foreground">Post-Mortem Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Why did you get it wrong? What's the trick?"
              className="border-2 border-[var(--line)] rounded-xl text-sm bg-background px-3 py-2 min-h-[80px] resize-y"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="border-3 border-[var(--line)] rounded-[14px] bg-card text-foreground text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140mg]">
              Cancel
            </button>
            <button
              onClick={handleLog}
              disabled={!confidence}
              className="border-3 border-[var(--line)] rounded-[14px] bg-[var(--leaf,#5dd39e)] text-foreground text-[0.82rem] font-black px-[14px] py-2.5 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Log
            </button>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No problems logged yet.</p>
      ) : (
        <div className="grid gap-3">
          {logs.map(entry => {
            const conf = CONFIDENCE.find(c => c.value === entry.confidence);
            return (
              <article key={entry.id} className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[5px_5px_0_var(--line)] p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <a href={entry.url} target="_blank" rel="noopener noreferrer" className="font-black text-lg hover:underline">
                      {entry.title}
                    </a>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {entry.tags.map(tag => {
                        const selectedTags = entry.selectedTags ?? [];
                        const active = selectedTags.includes(tag);
                        const maxed = !active && selectedTags.length >= 2;
                        return (
                          <button key={tag} type="button"
                            disabled={maxed}
                            onClick={() => {
                              const next = active
                                ? selectedTags.filter(t => t !== tag)
                                : [...selectedTags, tag];
                              const axes = [...new Set(next.map(t => TAG_TO_AXIS[t]).filter(Boolean))];
                              setLogs(updateLog(entry.id, { selectedTags: next, mainThemes: axes }));
                            }}
                            className={`text-[0.72rem] font-bold px-2 py-0.5 rounded-full border-2 transition-all duration-150
                              ${active
                                ? "border-[var(--line)] bg-primary text-primary-foreground shadow-[2px_2px_0_var(--line)]"
                                : "border-[var(--border)] bg-muted text-muted-foreground"}
                              ${maxed ? "opacity-30 cursor-not-allowed" : "hover:border-[var(--line)] cursor-pointer"}`}>
                            {tag}
                          </button>
                        );
                      })}
                      <select
                        value=""
                        onChange={(e) => {
                          const newTag = e.target.value;
                          const currentTags = entry.tags || [];
                          if (!newTag || currentTags.includes(newTag)) return;
                          setLogs(updateLog(entry.id, { tags: [...currentTags, newTag] }));
                        }}
                        className="text-[0.8rem] font-bold w-8 text-center py-0.5 px-0 appearance-none rounded-full border-2 border-dashed border-[var(--border)] bg-transparent text-muted-foreground hover:border-[var(--line)] hover:text-foreground cursor-pointer outline-none"
                      >
                        <option value="" disabled>+</option>
                        {Object.keys(TAG_TO_AXIS)
                          .filter(t => !(entry.tags || []).includes(t))
                          .sort()
                          .map(t => <option key={t} value={t}>{t}</option>)
                        }
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button onClick={() => setConfirmId(entry.id)} className="text-muted-foreground hover:text-[var(--accent)] text-xs font-black transition-colors" aria-label="Delete">✕</button>
                    <span className={`font-black text-sm ${DIFFICULTY_COLOR[entry.difficulty] ?? ""}`}>{entry.difficulty}</span>
                    {conf && <conf.Face size={32} />}
                    <span className="text-muted-foreground text-xs">{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {editingId === entry.id ? (
                  <div className="mt-2 p-3 bg-muted rounded-xl border-2 border-[var(--line)] flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.65rem] font-black uppercase text-muted-foreground">Any Mistakes?</label>
                      <div className="flex flex-wrap gap-1.5">
                        {MISTAKE_TYPES.map(m => {
                          const active = editMistakes.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                if (active) setEditMistakes(editMistakes.filter(x => x !== m));
                                else setEditMistakes([...editMistakes, m]);
                              }}
                              className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full border-2 transition-all duration-150
                                ${active
                                  ? "border-[var(--accent)] bg-background text-[var(--accent)] shadow-[1.5px_1.5px_0_var(--accent)]"
                                  : "border-[var(--border)] bg-background text-muted-foreground hover:border-[var(--line)]"}`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[0.65rem] font-black uppercase text-muted-foreground">Post-Mortem Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder="Why did you get it wrong? What's the trick?"
                        className="border-2 border-[var(--line)] rounded-xl text-xs bg-background px-3 py-1.5 min-h-[60px] resize-y"
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="border-2 border-[var(--line)] rounded-lg bg-card text-foreground text-[0.7rem] font-black px-2.5 py-1 shadow-[1.5px_1.5px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[0.5px_0.5px_0_var(--line)] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="border-2 border-[var(--line)] rounded-lg bg-[var(--leaf,#5dd39e)] text-foreground text-[0.7rem] font-black px-2.5 py-1 shadow-[1.5px_1.5px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[0.5px_0.5px_0_var(--line)] transition-all"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  (entry.mistakeTags?.length > 0 || entry.notes) ? (
                    <div className="mt-2 p-3 bg-muted rounded-xl border border-[var(--border)] flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4">
                        {entry.mistakeTags?.length > 0 ? (
                          <div className="flex gap-1.5 flex-wrap">
                            {entry.mistakeTags.map(m => (
                              <span key={m} className="text-[0.65rem] font-bold px-2 py-0.5 rounded text-[var(--accent)] border border-[var(--accent)] bg-background">
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : <div />}
                        <button
                          onClick={() => {
                            setEditingId(entry.id);
                            setEditNotes(entry.notes || "");
                            setEditMistakes(entry.mistakeTags || []);
                          }}
                          className="text-xs font-bold text-muted-foreground hover:text-foreground hover:underline transition-all cursor-pointer whitespace-nowrap"
                        >
                          Edit Note
                        </button>
                      </div>
                      {entry.notes && (
                        <p className="text-sm font-medium whitespace-pre-wrap">{entry.notes}</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditNotes("");
                        setEditMistakes([]);
                      }}
                      className="mt-1 self-start text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      + Add Note/Mistake
                    </button>
                  )
                )}
              </article>
            );
          })}
        </div>
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50" onClick={() => setConfirmId(null)}>
          <div className="border-3 border-[var(--line)] rounded-[18px] bg-card shadow-[8px_8px_0_var(--line)] p-6 flex flex-col gap-4 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-lg">Delete this log?</h3>
            <p className="text-muted-foreground text-sm">This can't be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmId(null)} className="border-3 border-[var(--line)] rounded-[14px] bg-card text-foreground text-[0.82rem] font-black px-[14px] py-2 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms]">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmId)} className="border-3 border-[var(--line)] rounded-[14px] bg-destructive text-white text-[0.82rem] font-black px-[14px] py-2 shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms]">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
