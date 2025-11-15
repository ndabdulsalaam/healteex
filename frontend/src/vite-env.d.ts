/// <reference types="vite/client" />

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

interface Window {
  google?: typeof google;
}

declare namespace google {
  namespace accounts {
    namespace id {
      type CredentialResponse = {
        credential: string;
        select_by?: string;
        clientId?: string;
      };

      function initialize(options: { client_id: string; callback: (response: CredentialResponse) => void }): void;
      function renderButton(parent: HTMLElement, options?: Record<string, unknown>): void;
      function prompt(): void;
    }
  }
}
