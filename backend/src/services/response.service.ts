import mongoose from "mongoose";
import Form from "../models/Form.js";
import Response from "../models/Response.js";
import type { SubmitResponseInput } from "../validators/response.validator.js";

export const submitResponse = async (
  shareId: string,
  input: SubmitResponseInput,
) => {
  const form = await Form.findOne({
    shareId,
    status: "published",
  });

  if (!form) {
    throw new Error("PUBLIC_FORM_NOT_FOUND");
  }

  const questionsById = new Map(
    form.questions.map((question) => [question._id?.toString(), question]),
  );

  const submittedAnswers = new Map(
    input.answers.map((answer) => [answer.questionId, answer.value]),
  );

  for (const answer of input.answers) {
    const question = questionsById.get(answer.questionId);

    if (!question) {
      throw new Error("INVALID_RESPONSE_QUESTION");
    }

    const value = answer.value;

    if (question.type === "short_text" || question.type === "long_text") {
      if (typeof value !== "string") {
        throw new Error("INVALID_ANSWER_TYPE");
      }

      if (question.required && value.trim().length === 0) {
        throw new Error("REQUIRED_QUESTION_MISSING");
      }
    }

    if (question.type === "single_choice") {
      if (typeof value !== "string") {
        throw new Error("INVALID_ANSWER_TYPE");
      }

      if (question.required && value.length === 0) {
        throw new Error("REQUIRED_QUESTION_MISSING");
      }

      if (value.length > 0 && !question.options.includes(value)) {
        throw new Error("INVALID_CHOICE_OPTION");
      }
    }

    if (question.type === "multiple_choice") {
      if (!Array.isArray(value)) {
        throw new Error("INVALID_ANSWER_TYPE");
      }

      if (question.required && value.length === 0) {
        throw new Error("REQUIRED_QUESTION_MISSING");
      }

      if (new Set(value).size !== value.length) {
        throw new Error("DUPLICATE_CHOICE_OPTION");
      }

      if (value.some((option) => !question.options.includes(option))) {
        throw new Error("INVALID_CHOICE_OPTION");
      }
    }

    if (question.type === "rating") {
      if (typeof value !== "number") {
        throw new Error("INVALID_ANSWER_TYPE");
      }

      if (value < 1 || value > 5 || !Number.isInteger(value)) {
        throw new Error("INVALID_RATING");
      }
    }
  }

  for (const question of form.questions) {
    if (
      question.required &&
      !submittedAnswers.has(question._id?.toString() ?? "")
    ) {
      throw new Error("REQUIRED_QUESTION_MISSING");
    }
  }

  const answers = input.answers.map((answer) => {
    const question = questionsById.get(answer.questionId)!;

    return {
      questionId: question._id!,
      questionLabel: question.label,
      questionType: question.type,
      value: answer.value,
    };
  });

  const response = await Response.create({
    form: form._id,
    answers,
  });

  return response;
};

export const getFormResponses = async (
  userId: string,
  formId: string,
  page: number,
  limit: number,
) => {
  if (!mongoose.isValidObjectId(formId)) {
    throw new Error("INVALID_FORM_ID");
  }

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  }).select("_id");

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  const skip = (page - 1) * limit;

  const [responses, total] = await Promise.all([
    Response.find({ form: form._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Response.countDocuments({ form: form._id }),
  ]);

  return {
    responses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getFormAnalytics = async (userId: string, formId: string) => {
  if (!mongoose.isValidObjectId(formId)) {
    throw new Error("INVALID_FORM_ID");
  }

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  const responses = await Response.find({ form: form._id });

  const questions = form.questions
    .filter(
      (question) =>
        question.type === "rating" ||
        question.type === "single_choice" ||
        question.type === "multiple_choice",
    )
    .map((question) => {
      const questionResponses = responses.flatMap((response) =>
        response.answers.filter(
          (answer) => answer.questionId.toString() === question._id?.toString(),
        ),
      );

      if (question.type === "rating") {
        const ratings = questionResponses
          .map((answer) => answer.value)
          .filter((value): value is number => typeof value === "number");

        const average =
          ratings.length === 0
            ? null
            : Math.round(
                (ratings.reduce((sum, rating) => sum + rating, 0) /
                  ratings.length) *
                  10,
              ) / 10;

        return {
          questionId: question._id,
          label: question.label,
          type: question.type,
          average,
          totalRatings: ratings.length,
        };
      }

      const optionCounts = new Map(
        question.options.map((option) => [option, 0]),
      );

      for (const answer of questionResponses) {
        if (
          question.type === "single_choice" &&
          typeof answer.value === "string"
        ) {
          optionCounts.set(
            answer.value,
            (optionCounts.get(answer.value) ?? 0) + 1,
          );
        }

        if (
          question.type === "multiple_choice" &&
          Array.isArray(answer.value)
        ) {
          for (const option of answer.value) {
            optionCounts.set(option, (optionCounts.get(option) ?? 0) + 1);
          }
        }
      }

      return {
        questionId: question._id,
        label: question.label,
        type: question.type,
        options: Array.from(optionCounts, ([label, count]) => ({
          label,
          count,
        })),
      };
    });

  return {
    totalResponses: responses.length,
    questions,
  };
};

const escapeCsvCell = (value: string): string => {
  const safeValue = /^[\s]*[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  return `"${safeValue.replace(/"/g, '""')}"`;
};

export const exportFormResponses = async (userId: string, formId: string) => {
  if (!mongoose.isValidObjectId(formId)) {
    throw new Error("INVALID_FORM_ID");
  }

  const form = await Form.findOne({
    _id: formId,
    owner: userId,
  });

  if (!form) {
    throw new Error("FORM_NOT_FOUND");
  }

  const responses = await Response.find({
    form: form._id,
  }).sort({ createdAt: -1 });

  const questions = [...form.questions].sort((a, b) => a.order - b.order);

  const headers = [
    "Submitted At",
    ...questions.map((question) => question.label),
  ];

  const rows = responses.map((response) => {
    const answersByQuestionId = new Map(
      response.answers.map((answer) => [
        answer.questionId.toString(),
        answer.value,
      ]),
    );

    return [
      response.createdAt.toISOString(),
      ...questions.map((question) => {
        const value = answersByQuestionId.get(question._id?.toString() ?? "");

        if (value === undefined) return "";

        return Array.isArray(value) ? value.join("; ") : String(value);
      }),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");

  return `\uFEFF${csv}`;
};
