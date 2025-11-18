/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string | undefined;
    NODE_ENV: string | undefined;
    [key: string]: string | undefined;
  }
}
