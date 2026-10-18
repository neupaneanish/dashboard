import { about, createAbout, updateAbout } from "./about";
import {
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
} from "./auth";
import {
  createDomain,
  deleteDomain,
  domain,
  domains,
  updateDomainTemplate,
  verifyDomain,
} from "./domain";
import {
  createEducation,
  deleteEducation,
  education,
  educations,
  updateEducation,
} from "./education";
import {
  createExperience,
  deleteExperience,
  experience,
  experiences,
  updateExperience,
} from "./experience";
import { createProfile, profile, updateProfile } from "./profile";
import {
  createSocial,
  deleteSocial,
  socialIcons,
  socials,
  updateSocial,
} from "./social";
import { templates } from "./template";

export const gateway = {
  // About
  about,
  createAbout,
  updateAbout,
  // Auth
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
  // Domain
  createDomain,
  deleteDomain,
  domain,
  domains,
  updateDomainTemplate,
  verifyDomain,
  // Education
  createEducation,
  deleteEducation,
  education,
  educations,
  updateEducation,
  // Experience
  createExperience,
  deleteExperience,
  experience,
  experiences,
  updateExperience,
  // Profile
  createProfile,
  profile,
  updateProfile,
  // Social
  createSocial,
  deleteSocial,
  socialIcons,
  socials,
  updateSocial,
  // Templates
  templates,
};
