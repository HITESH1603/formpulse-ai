import bcrypt from "bcryptjs";
import User from "../models/User.js";
import type {
  RegisterInput,
  LoginInput,
} from "../validators/auth.validator.js";


const dummyPasswordHash = bcrypt.hash("formpulse-dummy-password", 12);

export const registerUser = async (input: RegisterInput) => {
  const email = input.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const user = await User.create({
      name: input.name,
      email,
      password: passwordHash,
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
};

export const loginUser = async (input: LoginInput) => {
  const email = input.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select("+password");


  const passwordHash = user ? user.password : await dummyPasswordHash;

  const isPasswordValid = await bcrypt.compare(input.password, passwordHash);

  if (!user || !isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
};
