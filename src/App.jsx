import { useState, useEffect } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import LogPage from "./pages/LogPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { setStorageUser } from "./utils/storage.js";
import "./Dashboard.css";

const linkClass = ({ isActive }) =>
  `px-4 py-2 rounded-xl border-3 border-[var(--line)] text-sm font-black shadow-[3px_3px_0_var(--line)] transition-[transform,box-shadow] duration-[140ms] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] ${
    isActive ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
  }`;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setStorageUser(username);
  }, [username]);

  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  return (
    <div className="w-full max-w-[1180px] mx-auto px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <nav className="flex gap-3">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/log" className={linkClass}>Log</NavLink>
          <NavLink to="/stats" className={linkClass}>Stats</NavLink>
          <NavLink to="/community" className={linkClass}>Community</NavLink>
        </nav>
        <div>
          {token ? (
            <div className="flex items-center gap-3">
              <span className="font-bold">Hi, {username}!</span>
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg border-2 border-[var(--line)] bg-card font-bold hover:bg-muted transition-colors shadow-[2px_2px_0_var(--line)]">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="px-4 py-2 rounded-lg border-2 border-[var(--line)] bg-primary text-primary-foreground font-bold hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)] transition-all">
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Dashboard key={username || "anonymous"} token={token} />} />
        <Route path="/log" element={<LogPage key={username || "anonymous"} token={token} />} />
        <Route path="/stats" element={<StatsPage key={username || "anonymous"} />} />
        <Route path="/community" element={<CommunityPage />} />
      </Routes>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin} 
      />
    </div>
  );
}
