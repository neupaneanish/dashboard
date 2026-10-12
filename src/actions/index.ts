import { forgetPassword } from "./forgetPassword";
import { login } from "./login";
import { register } from "./register";
import { resend } from "./resend";
import { resetPassword } from "./resetPassword";
import { verification, verificationMethodToggle } from "./verification";

export const server = {
  forgetPassword,
  login,
  register,
  resend,
  resetPassword,
  verification,
  verificationMethodToggle,
};
