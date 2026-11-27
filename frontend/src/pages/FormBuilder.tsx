import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Question, QuestionType } from "../types/form.types";
import { createForm, getForm, updateForm } from "../services/form.service";

function FormBuilder() {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const isEditing = Boolean(formId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(isEditing);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) return;

    let cancelled = false;

    const loadForm = async () => {
      try {
        const form = await getForm(formId);

        if (cancelled) return;

        setTitle(form.title);
        setDescription(form.description);

        setQuestions(
          form.questions.map((question) => ({
            ...question,
            options: question.options ?? [],
          })),
        );
      } catch (error) {
        if (!cancelled) {
          setLoadFailed(true);
          setError(
            error instanceof Error ? error.message : "Unable to load form.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingForm(false);
        }
      }
    };

    void loadForm();

    return () => {
      cancelled = true;
    };
  }, [formId]);

  const addQuestion = () => {
    setQuestions((previous) => [
      ...previous,
      {
        label: "",
        type: "short_text",
        options: [],
        required: false,
        order: previous.length,
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setQuestions((previous) =>
      previous.map((question, i) =>
        i === index ? { ...question, ...updates } : question,
      ),
    );
  };

  const deleteQuestion = (index: number) => {
    setQuestions((previous) =>
      previous
        .filter((_, i) => i !== index)
        .map((question, i) => ({ ...question, order: i })),
    );
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    setQuestions((previous) => {
      const next = [...previous];
      const target = index + direction;

      if (target < 0 || target >= next.length) return previous;

      [next[index], next[target]] = [next[target], next[index]];

      return next.map((question, i) => ({ ...question, order: i }));
    });
  };

  const changeQuestionType = (index: number, type: QuestionType) => {
    updateQuestion(index, {
      type,
      options:
        type === "single_choice" || type === "multiple_choice" ? ["", ""] : [],
    });
  };

  const handleSave = async () => {
    setError("");

    if (title.trim().length < 3) {
      setError("Form title must be at least 3 characters.");
      return;
    }

    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }

    if (questions.some((question) => !question.label.trim())) {
      setError("Every question must have a label.");
      return;
    }

    if (
      questions.some(
        (question) =>
          (question.type === "single_choice" ||
            question.type === "multiple_choice") &&
          (question.options.length < 2 ||
            question.options.some((option) => !option.trim()) ||
            new Set(question.options.map((option) => option.trim())).size !==
              question.options.length),
      )
    ) {
      setError("Choice questions need at least two unique, non-empty options.");
      return;
    }

    setIsSaving(true);

    try {
      if (formId) {
        await updateForm(formId, {
          title: title.trim(),
          description: description.trim(),
          questions,
        });
      } else {
        await createForm({
          title: title.trim(),
          description: description.trim(),
          questions: questions.map((question) => ({
            label: question.label,
            type: question.type,
            options: question.options,
            required: question.required,
            order: question.order,
          })),
        });
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the form.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-600">
        Loading form...
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit form" : "Create form"}
          </h1>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Form title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Customer Feedback Survey"
              maxLength={120}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <label
              htmlFor="description"
              className="mb-2 mt-6 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell people what this form is about..."
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <span className="text-sm text-gray-500">
                {questions.length} questions
              </span>
            </div>

            {questions.map((question, index) => (
              <div
                key={question.id ?? index}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    Question {index + 1}
                  </h3>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moveQuestion(index, -1)}
                      disabled={index === 0}
                      className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => moveQuestion(index, 1)}
                      disabled={index === questions.length - 1}
                      className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteQuestion(index)}
                      className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Question label
                </label>

                <input
                  type="text"
                  value={question.label}
                  onChange={(event) =>
                    updateQuestion(index, { label: event.target.value })
                  }
                  placeholder="Enter your question"
                  maxLength={300}
                  className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500"
                />

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Question type
                </label>

                <select
                  value={question.type}
                  onChange={(event) =>
                    changeQuestionType(
                      index,
                      event.target.value as QuestionType,
                    )
                  }
                  className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="short_text">Short text</option>
                  <option value="long_text">Long text</option>
                  <option value="single_choice">Single choice</option>
                  <option value="multiple_choice">Multiple choice</option>
                  <option value="rating">Rating (1–5)</option>
                </select>

                {(question.type === "single_choice" ||
                  question.type === "multiple_choice") && (
                  <div className="mb-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Options</p>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          placeholder={`Option ${optionIndex + 1}`}
                          onChange={(event) =>
                            updateQuestion(index, {
                              options: question.options.map((item, i) =>
                                i === optionIndex ? event.target.value : item,
                              ),
                            })
                          }
                          maxLength={300}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(index, {
                              options: question.options.filter(
                                (_, i) => i !== optionIndex,
                              ),
                            })
                          }
                          disabled={question.options.length <= 2}
                          className="rounded-lg border px-3 text-sm text-red-600 disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(index, {
                          options: [...question.options, ""],
                        })
                      }
                      disabled={question.options.length >= 20}
                      className="text-sm font-medium text-indigo-600 disabled:opacity-40"
                    >
                      + Add option
                    </button>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(event) =>
                      updateQuestion(index, { required: event.target.checked })
                    }
                    className="h-4 w-4 rounded"
                  />
                  Required question
                </label>
              </div>
            ))}
          </section>

          <button
            type="button"
            onClick={addQuestion}
            disabled={questions.length >= 50}
            className="w-full rounded-lg border-2 border-dashed border-indigo-300 py-4 font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-40"
          >
            + Add question
          </button>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save form"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FormBuilder;
