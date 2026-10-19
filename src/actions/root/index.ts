import { about, updateAbout } from "./about";
import { updateRole, updateStatus, updateUsername, user, users } from "./auth";
import { deleteDomain, domain, domains } from "./domain";
import {
  deleteEducation,
  education,
  educations,
  updateEducation,
} from "./education";
import {
  deleteExperience,
  experience,
  experiences,
  updateExperience,
} from "./experience";
import { createIcon, deleteIcon, icon, icons, updateIcon } from "./icon";
import {
  createNameserver,
  deleteNameserver,
  nameserver,
  nameservers,
} from "./nameservers";
import { profile, updateProfile } from "./profile";
import { deleteSocial, social, socials, updateSocial } from "./social";
import {
  createTemplate,
  deleteTemplate,
  templateIcons,
  templates,
  updateTemplate,
} from "./template";

export const root = {
  // About
  about,
  updateAbout,
  // Auth
  updateRole,
  updateStatus,
  updateUsername,
  user,
  users,
  // Domain
  deleteDomain,
  domain,
  domains,
  // Profile
  profile,
  updateProfile,
  // Nameserver
  createNameserver,
  deleteNameserver,
  nameserver,
  nameservers,
  // Education
  deleteEducation,
  education,
  educations,
  updateEducation,
  // Experience
  deleteExperience,
  experience,
  experiences,
  updateExperience,
  // Icon
  createIcon,
  deleteIcon,
  icon,
  icons,
  updateIcon,
  // Template
  createTemplate,
  deleteTemplate,
  templateIcons,
  templates,
  updateTemplate,
  // Social
  deleteSocial,
  social,
  socials,
  updateSocial,
};
