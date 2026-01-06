// Manually defined environment types to replace missing vite/client types

interface ImportMetaEnv {
  MODE: string;
  BASE_URL: string;
  PROD: boolean;
  DEV: boolean;
  SSR: boolean;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string | undefined;
    NODE_ENV: string | undefined;
    [key: string]: string | undefined;
  }
}