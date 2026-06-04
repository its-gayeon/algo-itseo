import { useEffect, useState } from "react";
import MissionPanel from "./components/MissionPanel.jsx";
import Topbar from "./components/Topbar.jsx";
import { TIPS } from "./data/content.js";
import { formatDday, getTodayStr } from "./utils/date.js";
import { getStoredString, getTodayLogCount, setStoredValue, getLogs, isSolvedToday, getCurrentStreak, STORAGE_KEYS } from "./utils/storage.js";

export default function Dashboard() {
  const [interviewDate, setInterviewDate] = useState(() =>
    getStoredString(STORAGE_KEYS.interviewDate)
  );
  const [editingDate, setEditingDate] = useState(!getStoredString(STORAGE_KEYS.interviewDate));
  
  const streak = getCurrentStreak();
  const solvedToday = isSolvedToday();
  const totalSolved = getLogs().length;
  const [todayCount, setTodayCount] = useState(() => getTodayLogCount());
  const [communityProblems, setCommunityProblems] = useState([]);

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const res = await fetch("/api/community");
        if (res.ok) {
          const data = await res.json();
          // Keep only the 2 most recent problems
          setCommunityProblems(data.slice(0, 2));
        }
      } catch (err) {
        console.error("Failed to fetch community problems", err);
      }
    }
    fetchCommunity();
  }, []);

  function handleSaveDate(event) {
    event.preventDefault();
    setStoredValue(STORAGE_KEYS.interviewDate, interviewDate);
    setEditingDate(false);
  }

  function handleCheckin() {
    if (solvedToday) return;
    setStoredValue(STORAGE_KEYS.lastDate, getTodayStr());
    // Force re-render to update streak and solvedToday
    setTodayCount(getTodayLogCount()); 
  }

  return (
    <>
      <Topbar />
      <MissionPanel
        ddayLabel={formatDday(interviewDate)}
        editingDate={editingDate}
        interviewDate={interviewDate}
        solvedToday={solvedToday}
        streak={streak}
        tip={TIPS[new Date().getDay() % TIPS.length]}
        todayCount={todayCount}
        totalSolved={totalSolved}
        communityProblems={communityProblems}
        onCheckin={handleCheckin}
        onDateChange={setInterviewDate}
        onEditDate={() => setEditingDate(true)}
        onSaveDate={handleSaveDate}
      />
    </>
  );
}
