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
      .min(5, `Username is required`)
      .max(64, `Username must be no more than 64 characters long`)
      .regex(
        /^[a-z0-9][a-z0-9._-]*[a-z0-9]$/,
        "Username contains invalid characters",
      ),
  )
  .refine((val) => !/([._-]{2,})/.test(val), {
    message: `$Username must not contain consecutive dots, underscore, or hyphens`,
  });

export const titleSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
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
      }),
  );

export const nameSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(5, "Name is required")
      .max(24, "Name must be no more than 24 characters long")
      .regex(
        /^[a-zA-Z][a-zA-Z .'-]*[a-zA-Z.]$/,
        "Name contains invalid characters or starting structure",
      )
      .refine((val) => !/([ .,'-]{2,})/.test(val), {
        message:
          "Name must not contain consecutive dots, spaces, hyphens, or apostrophes",
      }),
  );

export const iconNameSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(1, "Name is required")
      .max(24, "Name must be no more than 24 characters long")
      .regex(
        /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/,
        "Name must be alphanumeric with single spaces only",
      )
      .refine((val) => !/( {2,})/.test(val), {
        message: "Name must not contain consecutive spaces",
      }),
  );

export const iconSiteSuffixSchema = z
  .string()
  .nullable()
  .optional()
  .transform((val) => (val === null || val === "" ? undefined : val))
  .pipe(
    z
      .string()
      .min(1, "Site suffix is required")
      .max(32, "Site suffix must be no more than 32 characters long")
      .regex(
        /^\/[a-zA-Z0-9_@.~-]*\/?$/,
        "Site suffix must start with a slash and contain valid path characters",
      )
      .refine((val) => !/(\/\/|\.\.|--|__|~~)/.test(val), {
        message:
          "Site suffix must not contain consecutive slashes, dots, underscores, or hyphens",
      })
      .optional(),
  );

export const iconSuffixSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(1, "Suffix is required")
      .max(128, "Suffix must be no more than 128 characters long")
      .regex(
        /^[a-zA-Z0-9]([a-zA-Z0-9/-]*[a-zA-Z0-9])?(\.svg)?$/,
        "Suffix contains invalid characters or structure",
      )
      .refine((val) => !/([/-]{2,})/.test(val), {
        message: "Suffix must not contain consecutive slashes or hyphens",
      }),
  );

export const iconColorSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .length(7, "Color must be exactly 7 characters (including #)")
      .regex(
        /^#[0-9a-fA-F]{6}$/,
        "Enter a valid hex color format (e.g. #ffffff)",
      ),
  );

export const templateNameSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(4, "Name is required")
      .max(24, "Name cannot exceed 24 characters")
      .regex(/^[a-zA-Z][a-zA-Z0-9 ]*[a-zA-Z0-9]$/, "Enter a valid name")
      .refine((val) => !/ {2,}/.test(val), {
        message: "Name must not contain consecutive spaces",
      }),
  );

export const templateDescriptionSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(4, "Description is required")
      .max(256, "Description cannot exceed 256 characters"),
  );

export const aboutSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(20, "About must be at least 20 characters long")
      .max(1000, "About must be no more than 1000 characters long"),
  );

export const usernameSchema = z
  .string()
  .nullable()
  .transform((val) => val ?? "")
  .pipe(
    z
      .string()
      .min(5, "Username must be minimum 5 characters")
      .regex(/^[a-z]+[0-9]*$/, "Enter a valid username"),
  );
