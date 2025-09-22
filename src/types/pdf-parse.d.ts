declare module "pdf-parse" {
  export interface PdfParseOptions {
    max?: number;
    pagerender?: (pageData: unknown) => string | Promise<string>;
    version?: string;
  }

  export interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata?: unknown;
    text: string;
    version: string;
  }

  // CommonJS export; works with esModuleInterop default imports
  function pdfParse(
    data: Buffer | ArrayBuffer | Uint8Array,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;

  export = pdfParse;
}
