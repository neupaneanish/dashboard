export interface Verification {
  session?: string | undefined;
  method?: number | undefined;
  expires?: number | undefined;
}

export interface Session {
  key: string;
  value: string;
}
