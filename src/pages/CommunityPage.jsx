import { useEffect, useState } from "react";
import ActivityGraph from "../components/ActivityGraph.jsx";

export default function CommunityPage() {
  const currentUser = localStorage.getItem("username");
  const [users, setUsers] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, problemsRes] = await Promise.all([
          fetch("/api/community/users"),
          fetch("/api/community")
        ]);
        
        if (!usersRes.ok || !problemsRes.ok) {
          throw new Error("Failed to load community data");
        }
        
        const [usersData, problemsData] = await Promise.all([
          usersRes.json(),
          problemsRes.json()
        ]);
        
        setUsers(usersData);
        setProblems(problemsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="w-full"><p className="font-bold">Loading...</p></div>;
  if (error) return <div className="w-full"><p className="text-red-500 font-bold">{error}</p></div>;

  return (
    <div className="w-full grid gap-8">
      <section>
        <h1 className="text-3xl font-black mb-6 flex items-center gap-2">
          <span className="text-2xl">🌍</span> Community Leaderboard
        </h1>
        {users.length === 0 ? (
          <div className="bg-card p-8 rounded-xl border-3 border-[var(--line)] shadow-[4px_4px_0_var(--line)] text-center">
            <p className="font-bold text-lg mb-2">No users found!</p>
            <p className="opacity-70">Be the first to share your achievements.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              {(showAllUsers ? users : users.slice(0, 4)).map((user) => (
                <div
                  key={user.username}
                  className="bg-card p-5 rounded-xl border-3 border-[var(--line)] shadow-[4px_4px_0_var(--line)] flex flex-col gap-3 transition-transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-xl">{user.username}</h3>
                      {user.username === currentUser && (
                        <span className="px-2 py-0.5 rounded text-[0.65rem] font-black border-2 border-[var(--line)] bg-primary text-primary-foreground shadow-[1px_1px_0_var(--line)]">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Total</span>
                      <span className="text-2xl font-black">{user.total_solved}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold uppercase opacity-60 mb-1">Last 7 Days Streak</p>
                    <ActivityGraph activityDates={user.activity} />
                  </div>
                </div>
              ))}
            </div>
            
            {users.length > 4 && (
              <button 
                onClick={() => setShowAllUsers(!showAllUsers)}
                className="self-center mt-2 px-6 py-2 rounded-xl border-3 border-[var(--line)] bg-muted font-black shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-all"
              >
                {showAllUsers ? "Show Less" : "See More"}
              </button>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <span className="text-xl">⚡</span> Recent Problem Shares
        </h2>
        {problems.length === 0 ? (
          <p className="text-muted-foreground font-bold">No problems shared yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {problems.map((prob) => (
              <div
                key={prob.id}
                className="bg-card p-4 rounded-xl border-3 border-[var(--line)] shadow-[3px_3px_0_var(--line)] flex flex-col gap-2 transition-transform hover:-translate-y-1"
              >
                <a 
                  href={prob.url || `https://leetcode.com/problems/${prob.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-black text-lg hover:underline inline-block"
                >
                  {prob.title}
                </a>
                <div className="flex items-center gap-2">
                  <p className="text-xs opacity-80 font-bold">
                    Solved by <span className="text-primary">{prob.username}</span> on {prob.date}
                  </p>
                  {prob.username === currentUser && (
                    <span className="px-2 py-0.5 rounded text-[0.6rem] font-black border-2 border-[var(--line)] bg-primary text-primary-foreground">
                      YOU
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
