import { z } from "astro/zod";

export const textSchema = (min: number, max: number, fieldName: string) =>
  z
    .string()
    .nullable()
    .transform((val) => val ?? "")
    .pipe(
      z
        .string()
        .min(min, `${fieldName} must be at least ${min} characters long`)
        .max(max, `${fieldName} must be no more than ${max} characters long`)
        .regex(
          /^[a-zA-Z0-9][a-zA-Z0-9 .,'-]*[a-zA-Z0-9]$/,
          `${fieldName} contains invalid characters or structure`,
        ),
    )
    .refine((val) => !/([ .,'-]{2,})/.test(val), {
      message: `${fieldName} must not contain consecutive spaces, dots, commas, or hyphens`,
    });

export const optionalString = (min: number, max: number, fieldName: string) =>
  z
    .string()
    .optional()
    .transform((val) => {
      if (val === null || val === "") return undefined;
      return textSchema(min, max, fieldName).parse(val);
    });

export const dateSchema = (fieldName: string) =>
  z
    .string()
    .nullable()
    .transform((val) => val ?? "")
    .pipe(
      z
        .string()
        .min(1, `${fieldName} is required`)
        .pipe(
          z.iso
            .date({
              message: `Enter a valid date (YYYY-MM-DD)`,
            })
            .transform((val) => new Date(val))
            .refine((date) => date <= new Date(), {
              message: `${fieldName} cannot be in the future`,
            }),
        ),
    );

export const optionalDateSchema = (fieldName: string) =>
  z
    .string()
    .nullish()
    .transform((val) => {
      if (val === null || val === "") return undefined;
      return dateSchema(fieldName).parse(val);
    });

export const optionalDescription = (fieldName: string) =>
  z
    .string()
    .nullish()
    .transform((val) => val ?? "")
    .pipe(
      z
        .string()
        .transform((val) => (val === "" ? undefined : val))
        .pipe(
          z
            .string()
            .min(5, `${fieldName} must be at least 5 characters long`)
            .max(1000, `${fieldName} must be no more than 1000 characters long`)
            .optional(),
        ),
    );

export const socialUsername = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(5, `Username must be at least 5 characters long`)
      .max(64, `Username must be no more than 64 characters long`)
      .regex(
        /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/,
        "Username contains invalid characters or structure",
      ),
  )
  .refine((val) => !/([._-]{2,})/.test(val), {
    message: `$Username must not contain consecutive dots, underscore, or hyphens`,
  });

export const titleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters long")
  .max(64, "Title must be no more than 64 characters long")
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9 .'&/()-]*[a-zA-Z0-9).]$/,
    "Title contains invalid characters or structure",
  )
  .refine((val) => !/([ .'&/()-]{2,})/.test(val), {
    message:
      "Title must not contain consecutive dots, spaces, hyphens, symbols, or brackets",
  });

export const createUpdateExperienceSchema = z
  .object({
    title: textSchema(5, 64, "Title"),
    companyName: textSchema(5, 64, "Company Name"),
    location: textSchema(3, 64, "Location"),
    locationType: z.enum(["onsite", "hybrid", "remote"]),
    startDate: dateSchema("Start Date"),
    endDate: optionalDateSchema("End Date"),
    description: optionalDescription("Description"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate) {
      const now = new Date();
      if (data.endDate > now) {
        ctx.addIssue({
          code: "custom",
          message: "End date cannot be in the future.",
          path: ["endDate"],
        });
      }
      if (data.endDate <= data.startDate) {
        ctx.addIssue({
          code: "custom",
          message: "End date must be after the start date.",
          path: ["endDate"],
        });
      }
    }
  });

export const createUpdateEducationSchema = z
  .object({
    school: textSchema(3, 64, "School"),
    degree: textSchema(5, 64, "Degree"),
    address: textSchema(3, 64, "Address"),
    affiliation: optionalString(5, 64, "Affiliation"),
    fieldOfStudy: optionalString(5, 64, "Field of study"),
    concentration: optionalString(5, 64, "Concentration"),
    description: optionalDescription("Description"),
    startDate: dateSchema("Start Date"),
    endDate: optionalDateSchema("End Date"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate) {
      const now = new Date();
      if (data.endDate > now) {
        ctx.addIssue({
          code: "custom",
          message: "End date cannot be in the future.",
          path: ["endDate"],
        });
      }
      if (data.endDate <= data.startDate) {
        ctx.addIssue({
          code: "custom",
          message: "End date must be after the start date.",
          path: ["endDate"],
        });
      }
    }
  });

export const nameSchema = z
  .string()
  .min(5, "Name must be at least 5 characters long")
  .max(24, "Name must be no more than 24 characters long")
  .regex(
    /^[a-zA-Z][a-zA-Z .'-]*[a-zA-Z.]$/,
    "Name contains invalid characters or starting structure",
  )
  .refine((val) => !/([ .,'-]{2,})/.test(val), {
    message:
      "Name must not contain consecutive dots, spaces, hyphens, or apostrophes",
  });
