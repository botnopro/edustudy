/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL in production (e.g. https://your-app.onrender.com/api/v1). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Mammoth browser build (đọc file .docx phía trình duyệt)
declare module 'mammoth/mammoth.browser' {
  interface MammothResult {
    value: string;
    messages: any[];
  }
  const mammoth: {
    extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
    convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
  };
  export default mammoth;
}
