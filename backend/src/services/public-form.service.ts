import Form from "../models/Form.js";

export const getPublicForm = async (shareId: string) => {
  const form = await Form.findOne({
    shareId,
    status: "published",
  }).select("shareId title description questions");

  if (!form) {
    throw new Error("PUBLIC_FORM_NOT_FOUND");
  }

  return {
    shareId: form.shareId,
    title: form.title,
    description: form.description,
    questions: form.questions.map((question) => ({
      id: question._id?.toString(),
      label: question.label,
      type: question.type,
      options: question.options,
      required: question.required,
      order: question.order,
    })),
  };
};
