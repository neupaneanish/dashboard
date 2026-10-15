import { VerificationMethod } from "../protobuf/external/authentication/v1/authentication_pb";
import { PasswordVerificationMethod } from "../protobuf/gateway/authentication/v1/authentication_pb";

export const PasswordVerificationHeading = (
  method: PasswordVerificationMethod,
): string => {
  switch (method) {
    case PasswordVerificationMethod.ENABLED:
      return "Enable 2FA Verification";
    case PasswordVerificationMethod.DISABLED:
      return "Disable 2FA Verification";
    case PasswordVerificationMethod.EMAIL:
      return "Change Email Verification";
    case PasswordVerificationMethod.CHANGE:
      return "Password Change Verification";
    default:
      return "Verification";
  }
};

export const VerificationHeading = (method: VerificationMethod): string => {
  switch (method) {
    case VerificationMethod.ACCOUNT:
      return "Account Verification";
    case VerificationMethod.EMAIL:
      return "Email Verification";
    case VerificationMethod.RESET:
      return "Reset Verification";
    case VerificationMethod.TWO_FACTOR:
      return "2FA Verification";
    default:
      return "Verification";
  }
};
