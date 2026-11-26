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
