import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

const getCookieMaxAge = (): number => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (!unit) {
    return 24 * 60 * 60 * 1000;
  }
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const multiplier = multipliers[unit];

  if (multiplier === undefined) {
    return 24 * 60 * 60 * 1000;
  }

  return value * multiplier;
};

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: getCookieMaxAge(),
};

export const clearAuthCookieOptions: CookieOptions = {
  ...authCookieOptions,
  maxAge: undefined,
};
