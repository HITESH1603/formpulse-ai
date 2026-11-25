import User from "../models/User.js";

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};
