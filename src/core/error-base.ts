/**
 * Error type codes recognized by `@denkiyagi/pdf-lib`.
 */
export const PDFLibErrorTypes = {
  /**
   * Function arguments/options outside the public contract
   * (wrong type, invalid range, missing setup).
   */
  INVALID_CALLER_INPUT: 'INVALID_CALLER_INPUT',

  /**
   * Encoded data supplied from outside violates
   * the relevant spec or is structurally corrupt.
   */
  INVALID_EXTERNAL_BINARY_DATA: 'INVALID_EXTERNAL_BINARY_DATA',

  /**
   * Data supplied from outside decodes successfully but requests
   * features or formats we intentionally do not support.
   */
  UNSUPPORTED_EXTERNAL_BINARY_DATA: 'UNSUPPORTED_EXTERNAL_BINARY_DATA',

  /**
   * Invariant breach that should be unreachable if
   * inputs and implementation are correct.
   */
  INTERNAL_ASSERTION: 'INTERNAL_ASSERTION',
} as const;

/**
 * Error type code recognized by `@denkiyagi/pdf-lib`.
 */
export type PDFLibErrorType =
  (typeof PDFLibErrorTypes)[keyof typeof PDFLibErrorTypes];

/**
 * Base class for all errors explicitly thrown by `@denkiyagi/pdf-lib`.
 */
export class PDFLibError extends Error {
  /**
   * Machine-readable classification for the failure.
   */
  readonly type: PDFLibErrorType;

  constructor(type: PDFLibErrorType, message: string, options?: ErrorOptions) {
    super(message, options);

    this.name = new.target.name;
    this.type = type;
  }
}
