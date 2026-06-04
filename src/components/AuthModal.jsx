import { useState } from "react";

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/login" : "/api/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Could not connect to the server. Is the backend running?");
      }

      if (!res.ok) {
        throw new Error(data?.error || "An error occurred");
      }

      onLogin(data.token, data.username);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-sm rounded-xl border-3 border-[var(--line)] p-6 shadow-[6px_6px_0_var(--line)]">
        <h2 className="text-2xl font-black mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm font-bold border-2 border-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 rounded border-2 border-[var(--line)] bg-background font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 rounded border-2 border-[var(--line)] bg-background font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-black border-2 border-[var(--line)] shadow-[3px_3px_0_var(--line)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] transition-all"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center font-bold">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary underline hover:text-opacity-80"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
        
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 rounded font-bold border-2 border-transparent hover:border-[var(--line)] transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
