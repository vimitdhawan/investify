import { z } from "zod";

export const PasswordInputValidation = z.string().superRefine((value, ctx) => {
  const errors: string[] = [];

  if (value.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(value)) {
    errors.push("Password must contain one uppercase letter");
  }
  if (!/[a-z]/.test(value)) {
    errors.push("Password must contain one lowercase letter");
  }
  if (!/[0-9]/.test(value)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(value)) {
    errors.push("Password must contain one special character");
  }

  if (errors.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: errors.join("\n"),
    });
  }
});
