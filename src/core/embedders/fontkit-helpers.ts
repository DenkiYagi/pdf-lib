import {
  AssertionError as FontkitAssertionError,
  InvalidCallerInputError as FontkitInvalidCallerInputError,
  InvalidFontDataError as FontkitInvalidFontDataError,
  UnsupportedFontDataError as FontkitUnsupportedFontDataError,
  UnsupportedFontFileFormatError as FontkitUnsupportedFontFileFormatError,
} from '@denkiyagi/fontkit';
import { PDFLibError } from 'src/core/error-base';
import {
  FontkitAssertionError as PDFLibFontkitAssertionError,
  InvalidFontDataError,
  UnsupportedFontDataError,
  UnsupportedFontFileFormatError,
} from 'src/core/errors';

/**
 * Map known fontkit errors into the pdf-lib error family
 * so callers do not see raw fontkit exceptions.
 */
export const mapFontkitError = (error: unknown): PDFLibError => {
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

  const msg =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return new PDFLibFontkitAssertionError(`Unknown error: ${msg}`);
};
