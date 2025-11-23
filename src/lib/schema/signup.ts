import * as z from "zod";
import { PasswordInputValidation } from "@/lib/schema/pasword";

export const signupFormBaseSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: PasswordInputValidation,
  confirmPassword: z.string().min(1, "Confirm password can't be empty"),
});

// Add multiple refinements
export const signupFormSchema = signupFormBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type SignupFormData = z.infer<typeof signupFormSchema>;

export type SignupActionState = {
  errors?: {
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};
