import {
  AssertionError as FontkitAssertionError,
  InvalidCallerInputError as FontkitInvalidCallerInputError,
  InvalidFontDataError as FontkitInvalidFontDataError,
  UnsupportedFontDataError as FontkitUnsupportedFontDataError,
  UnsupportedFontFileFormatError as FontkitUnsupportedFontFileFormatError,
} from '@denkiyagi/fontkit';
import {
  FontkitAssertionError as PDFLibFontkitAssertionError,
  InvalidFontDataError,
  UnsupportedFontDataError,
  UnsupportedFontFileFormatError,
} from 'src/core/errors.js';
import type { PDFLibError } from 'src/core/error-base.js';

/**
 * Map known fontkit errors into the pdf-lib error family
 * so callers do not see raw fontkit exceptions.
 *
 * Returns `null` if the error is not recognized.
 */
export const mapFontkitError = (error: unknown): PDFLibError | null => {
  if (error instanceof FontkitUnsupportedFontFileFormatError) {
    return new UnsupportedFontFileFormatError(error.message);
  }

  if (error instanceof FontkitUnsupportedFontDataError) {
    return new UnsupportedFontDataError(error.message);
  }

  if (error instanceof FontkitInvalidFontDataError) {
    return new InvalidFontDataError(error.message);
  }

  if (
    error instanceof FontkitInvalidCallerInputError ||
    error instanceof FontkitAssertionError
  ) {
    return new PDFLibFontkitAssertionError(error.message);
  }

  return null;
};
