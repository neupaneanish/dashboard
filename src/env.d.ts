/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: {
      username: string;
      role: string;
      session: string;
      userID: string;
    } | null;
  }
}
