import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  closeForm,
  deleteForm,
  getForms,
  publishForm,
} from "../services/form.service";
import type { Form } from "../types/form.types";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [updatingFormId, setUpdatingFormId] = useState<string | null>(null);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await getForms();
        setForms(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Unable to load forms",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchForms();
  }, []);

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDelete = async (formId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this form and all its responses?",
    );

    if (!confirmed) return;

    setError("");
    setDeletingFormId(formId);

    try {
      await deleteForm(formId);
      setForms((previousForms) =>
        previousForms.filter((form) => form.id !== formId),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete form",
      );
    } finally {
      setDeletingFormId(null);
    }
  };

  const handlePublish = async (formId: string) => {
    setError("");
    setUpdatingFormId(formId);

    try {
      const updatedForm = await publishForm(formId);

      setForms((previousForms) =>
        previousForms.map((form) => (form.id === formId ? updatedForm : form)),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to publish form",
      );
    } finally {
      setUpdatingFormId(null);
    }
  };

  const handleClose = async (formId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this form? People will no longer be able to submit responses.",
    );

    if (!confirmed) return;

    setError("");
    setUpdatingFormId(formId);

    try {
      const updatedForm = await closeForm(formId);

      setForms((previousForms) =>
        previousForms.map((form) => (form.id === formId ? updatedForm : form)),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to close form");
    } finally {
      setUpdatingFormId(null);
    }
  };

  const handleCopyLink = async (form: Form) => {
    if (!form.shareId) {
      setError("Share link is not available for this form.");
      return;
    }

    const shareLink = `${window.location.origin}/f/${form.shareId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedFormId(form.id);
      setError("");
    } catch {
      setError("Unable to copy the link. Please copy it manually.");
    }
  };

  const getStatusStyle = (status: Form["status"]) => {
    switch (status) {
      case "published":
        return "bg-emerald-500/10 text-emerald-400";
      case "closed":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-amber-500/10 text-amber-400";
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

        <section className="flex flex-wrap items-center justify-between gap-4 py-10">
          <div>
            <h2 className="text-3xl font-bold">Welcome, {user?.name}</h2>
            <p className="mt-2 text-slate-400">{user?.email}</p>
          </div>

          <button
            onClick={() => navigate("/forms/new")}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500"
          >
            + Create form
          </button>
        </section>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your forms</h3>
            <span className="text-sm text-slate-400">
              {forms.length} {forms.length === 1 ? "form" : "forms"}
            </span>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              Loading your forms...
            </div>
          ) : forms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
              <h4 className="text-lg font-semibold">No forms yet</h4>
              <p className="mt-2 text-sm text-slate-400">
                Create your first form to start collecting responses.
              </p>
              <button
                onClick={() => navigate("/forms/new")}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-500"
              >
                Create your first form
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {forms.map((form) => (
                <article
                  key={form.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h4 className="text-lg font-semibold">{form.title}</h4>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(form.status)}`}
                    >
                      {form.status}
                    </span>
                  </div>

                  <p className="mt-2 min-h-10 text-sm text-slate-400">
                    {form.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <span>
                      {form.questions.length}{" "}
                      {form.questions.length === 1 ? "question" : "questions"}
                    </span>
                    <span>
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {form.status === "published" && form.shareId && (
                    <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-3">
                      <p className="mb-2 text-xs font-medium text-slate-400">
                        Public sharing link
                      </p>
                      <p className="break-all text-sm text-slate-300">
                        {`${window.location.origin}/f/${form.shareId}`}
                      </p>
                      <button
                        onClick={() => void handleCopyLink(form)}
                        className="mt-3 rounded-lg border border-indigo-500/40 px-3 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/10"
                      >
                        {copiedFormId === form.id ? "Copied!" : "Copy link"}
                      </button>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-4">
                    <button
                      onClick={() => navigate(`/forms/${form.id}/edit`)}
                      className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => navigate(`/forms/${form.id}/results`)}
                      className="flex-1 rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/10"
                    >
                      View Results
                    </button>

                    {form.status === "draft" && (
                      <button
                        onClick={() => void handlePublish(form.id)}
                        disabled={updatingFormId === form.id}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {updatingFormId === form.id
                          ? "Publishing..."
                          : "Publish"}
                      </button>
                    )}

                    {form.status === "published" && (
                      <button
                        onClick={() => void handleClose(form.id)}
                        disabled={updatingFormId === form.id}
                        className="flex-1 rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/10 disabled:opacity-50"
                      >
                        {updatingFormId === form.id ? "Closing..." : "Close"}
                      </button>
                    )}

                    {form.status === "closed" && (
                      <button
                        onClick={() => void handlePublish(form.id)}
                        disabled={updatingFormId === form.id}
                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium transition hover:bg-emerald-500 disabled:opacity-50"
                      >
                        {updatingFormId === form.id ? "Reopening..." : "Reopen"}
                      </button>
                    )}

                    <button
                      onClick={() => void handleDelete(form.id)}
                      disabled={deletingFormId === form.id}
                      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingFormId === form.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
