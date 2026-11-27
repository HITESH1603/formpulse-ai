import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import {
  getPublicForm,
  submitPublicResponse,
} from "../services/publicForm.services";
import type { AnswerValue, PublicFormData } from "../types/publicForm.types";

const PublicForm = () => {
  const { shareId } = useParams<{ shareId: string }>();

  const [form, setForm] = useState<PublicFormData | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isInvalidLink = !shareId;

  useEffect(() => {
    if (!shareId) return;

    let cancelled = false;

    const loadForm = async () => {
      setIsLoading(true);
      setError("");
      setForm(null);

      try {
        const data = await getPublicForm(shareId);

        if (!cancelled) {
          setForm(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Unable to load form",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadForm();

    return () => {
      cancelled = true;
    };
  }, [shareId]);

  const updateAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  const toggleOption = (
    questionId: string,
    option: string,
    checked: boolean,
  ) => {
    setAnswers((previous) => {
      const current = Array.isArray(previous[questionId])
        ? previous[questionId]
        : [];

      const updated = checked
        ? [...current, option]
        : current.filter((item) => item !== option);

      return {
        ...previous,
        [questionId]: updated,
      };
    });
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form || !shareId) return;

    const unansweredRequired = form.questions.find((question) => {
      const answer = answers[question.id];

      if (!question.required) return false;
      if (answer === undefined || answer === "") return true;
      if (Array.isArray(answer) && answer.length === 0) return true;

      return false;
    });

    if (unansweredRequired) {
      setError(`Please answer: ${unansweredRequired.label}`);
      return;
    }

    const submittedAnswers = form.questions.flatMap((question) => {
      const value = answers[question.id];

      if (value === undefined || value === "") return [];
      if (Array.isArray(value) && value.length === 0) return [];
      if (typeof value === "string" && !value.trim()) return [];

      return [
        {
          questionId: question.id,
          value,
        },
      ];
    });

    if (submittedAnswers.length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      await submitPublicResponse(shareId, {
        answers: submittedAnswers,
      });

      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit your response",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInvalidLink) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-slate-300">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Invalid form link
          </h1>
          <p className="mt-2 text-slate-400">
            Please check the link and try again.
          </p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Loading form...
      </main>
    );
  }

  if (!form) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-slate-300">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Form unavailable
          </h1>
          <p className="mt-2 text-slate-400">
            {error || "This form may have been closed or no longer exists."}
          </p>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl text-emerald-400">
            ✓
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-white">
            Response submitted!
          </h1>
          <p className="mt-3 text-slate-400">
            Thank you for taking the time to complete this form.
          </p>
        </div>
      </main>
    );
  }

  const sortedQuestions = [...form.questions].sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 text-center">
          <span className="text-xl font-bold tracking-tight text-indigo-400">
            FormPulse AI
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
        >
          <div className="border-b border-slate-800 px-6 py-8 sm:px-8">
            <h1 className="text-3xl font-bold text-white">{form.title}</h1>

            {form.description && (
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-slate-400">
                {form.description}
              </p>
            )}
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-8">
            {sortedQuestions.map((question, index) => (
              <section key={question.id}>
                <label className="mb-3 block font-medium text-white">
                  <span className="mr-2 text-slate-500">{index + 1}.</span>
                  {question.label}
                  {question.required && (
                    <span className="ml-1 text-red-400">*</span>
                  )}
                </label>

                {question.type === "short_text" && (
                  <input
                    type="text"
                    maxLength={5000}
                    value={
                      typeof answers[question.id] === "string"
                        ? (answers[question.id] as string)
                        : ""
                    }
                    onChange={(event) =>
                      updateAnswer(question.id, event.target.value)
                    }
                    placeholder="Your answer"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                  />
                )}

                {question.type === "long_text" && (
                  <textarea
                    maxLength={5000}
                    rows={4}
                    value={
                      typeof answers[question.id] === "string"
                        ? (answers[question.id] as string)
                        : ""
                    }
                    onChange={(event) =>
                      updateAnswer(question.id, event.target.value)
                    }
                    placeholder="Your answer"
                    className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                  />
                )}

                {question.type === "single_choice" && (
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 text-slate-300"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => updateAnswer(question.id, option)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "multiple_choice" && (
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(answers[question.id]) &&
                            (answers[question.id] as string[]).includes(option)
                          }
                          onChange={(event) =>
                            toggleOption(
                              question.id,
                              option,
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4 accent-indigo-500"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "rating" && (
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <label
                        key={rating}
                        className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border transition ${
                          answers[question.id] === rating
                            ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                            : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={rating}
                          checked={answers[question.id] === rating}
                          onChange={() => updateAnswer(question.id, rating)}
                          className="sr-only"
                        />
                        {rating}
                      </label>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit response"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Powered by FormPulse AI
        </p>
      </div>
    </main>
  );
};

export default PublicForm;
