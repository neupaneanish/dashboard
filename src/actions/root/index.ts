import { updateRole } from "./auth/updateRole";
import { updateStatus } from "./auth/updateStatus";
import { updateUsername } from "./auth/updateUsername";
import { user } from "./auth/user";
import { users } from "./auth/users";

export const root = {
  updateRole,
  updateStatus,
  updateUsername,
  user,
  users,
};
