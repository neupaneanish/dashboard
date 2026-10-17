import { changeEmail } from "./changeEmail";
import { changePassword } from "./changePassword";
import { logout } from "./logout";
import { logoutAll } from "./logoutAll";
import {
  sessionVerification,
  sessionVerificationMethod,
} from "./passwordSessionVerification";
import { passwordVerification } from "./passwordVerification";
import { resend } from "./resend";
import { updateUsername } from "./updateUsername";
import { user } from "./user";

export const gateway = {
  changeEmail,
  changePassword,
  logout,
  logoutAll,
  passwordVerification,
  resend,
  sessionVerification,
  sessionVerificationMethod,
  updateUsername,
  user,
};
