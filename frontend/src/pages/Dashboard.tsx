
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to log out",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold">FormPulse AI</h1>
            <p className="mt-1 text-sm text-slate-400">
              Create forms. Collect opinions. Discover insights.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <section className="py-10">
          <h2 className="text-3xl font-bold">
            Welcome, {user?.name}
          </h2>
          <p className="mt-2 text-slate-400">{user?.email}</p>
        </section>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h3 className="text-xl font-semibold">Your forms</h3>
          <p className="mt-2 text-slate-400">
            Your forms will appear here. Form creation is coming next.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
