/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import("./utils").User | null;
  }
}
