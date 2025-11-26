/**
 * Base class for all errors explicitly thrown by `@denkiyagi/pdf-lib`.
 */
export class PDFLibError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = new.target.name;
  }
}
