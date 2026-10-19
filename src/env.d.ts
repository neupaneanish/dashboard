/// <reference types="astro/client" />
import type { Valkey } from "iovalkey";

declare global {
  namespace App {
    interface Locals {
      valkey: Valkey;
    }
  }
}

export {};
