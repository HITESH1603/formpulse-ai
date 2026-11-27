import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  exportFormResponses,
  getFormAnalytics,
  getFormResponses,
} from "../services/results.services";
import type {
  FormAnalytics,
  FormResponse,
  ResponsePagination,
} from "../types/results.types";

const Results = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [pagination, setPagination] = useState<ResponsePagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) return;

    const fetchResults = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [analyticsData, responsesData] = await Promise.all([
          getFormAnalytics(formId),
          getFormResponses(formId, page),
        ]);

        setAnalytics(analyticsData);
        setResponses(responsesData.data);
        setPagination(responsesData.pagination);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load form results",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchResults();
  }, [formId, page]);

  const handleExport = async () => {
    if (!formId) return;

    setError("");
    setIsExporting(true);

    try {
      await exportFormResponses(formId);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to export responses",
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!formId) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-center text-white">
        <p className="text-red-400">Invalid form ID.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-indigo-400 hover:text-indigo-300"
        >
          Back to dashboard
        </button>
      </main>
    );
  }

  const choiceQuestions =
    analytics?.questions.filter(
      (question) =>
        question.type === "single_choice" ||
        question.type === "multiple_choice",
    ) ?? [];

  const validChoiceQuestions = choiceQuestions.filter(
    (question) => "options" in question,
  );
  const ratingQuestions =
    analytics?.questions.filter((question) => question.type === "rating") ?? [];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold">FormPulse AI</h1>
            <p className="mt-1 text-sm text-slate-400">
              Form results and response analytics
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Back to dashboard
          </button>
        </header>

        <section className="flex flex-wrap items-center justify-between gap-4 py-10">
          <div>
            <h2 className="text-3xl font-bold">Results & Analytics</h2>
            <p className="mt-2 text-slate-400">
              Understand the responses collected by your form.
            </p>
          </div>

          <button
            onClick={() => void handleExport()}
            disabled={isExporting || isLoading}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </section>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading results...
          </div>
        ) : !analytics ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Unable to display analytics.
          </div>
        ) : (
          <>
            <section className="mb-10 grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Total responses</p>
                <h3 className="mt-3 text-4xl font-bold text-indigo-400">
                  {analytics.totalResponses}
                </h3>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Questions with analytics
                </p>
                <h3 className="mt-3 text-4xl font-bold text-emerald-400">
                  {analytics.questions.length}
                </h3>
              </article>
            </section>

            {analytics.totalResponses === 0 ? (
              <div className="mb-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
                <h3 className="text-lg font-semibold">No responses yet</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Share your public form link to start collecting responses.
                </p>
              </div>
            ) : (
              <>
                {choiceQuestions.length > 0 && (
                  <section className="mb-10">
                    <h3 className="mb-5 text-xl font-semibold">
                      Choice question results
                    </h3>

                    <div className="grid gap-5 md:grid-cols-2">
                      {validChoiceQuestions.map((question) => (
                        <article
                          key={question.questionId}
                          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                        >
                          <h4 className="mb-6 font-semibold">
                            {question.label}
                          </h4>

                          <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={question.options}
                                margin={{
                                  top: 5,
                                  right: 10,
                                  left: -20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#334155"
                                />
                                <XAxis
                                  dataKey="label"
                                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                                  interval={0}
                                  angle={-15}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis
                                  allowDecimals={false}
                                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#0f172a",
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "#fff",
                                  }}
                                />
                                <Bar
                                  dataKey="count"
                                  fill="#818cf8"
                                  radius={[5, 5, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {ratingQuestions.length > 0 && (
                  <section className="mb-10">
                    <h3 className="mb-5 text-xl font-semibold">
                      Rating question results
                    </h3>

                    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={ratingQuestions.map((question) => ({
                              label: question.label,
                              average: question.average ?? 0,
                            }))}
                            margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#334155"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: "#94a3b8", fontSize: 11 }}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis
                              domain={[0, 5]}
                              tick={{ fill: "#94a3b8", fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                                color: "#fff",
                              }}
                            />
                            <Bar
                              dataKey="average"
                              name="Average rating"
                              fill="#34d399"
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {ratingQuestions.map((question) => (
                          <div
                            key={question.questionId}
                            className="rounded-lg bg-slate-950 p-4"
                          >
                            <p className="text-sm text-slate-400">
                              {question.label}
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-400">
                              {question.average === null
                                ? "No ratings"
                                : `${question.average} / 5`}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {question.totalRatings} ratings
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  </section>
                )}
              </>
            )}

            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-semibold">Individual responses</h3>
                <span className="text-sm text-slate-400">
                  {pagination?.total ?? 0} total responses
                </span>
              </div>

              {responses.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
                  No individual responses to display.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
                      <tr>
                        <th className="px-5 py-4 font-medium">Submitted at</th>
                        <th className="px-5 py-4 font-medium">Answers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {responses.map((response) => (
                        <tr key={response.id}>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-400">
                            {new Date(response.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-3">
                              {response.answers.map((answer) => (
                                <div key={answer.questionId}>
                                  <p className="font-medium text-slate-300">
                                    {answer.questionLabel}
                                  </p>
                                  <p className="mt-1 whitespace-pre-wrap text-slate-400">
                                    {Array.isArray(answer.value)
                                      ? answer.value.join(", ")
                                      : String(answer.value)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between">
                  <button
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page <= 1 || isLoading}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-slate-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= pagination.totalPages || isLoading}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default Results;
