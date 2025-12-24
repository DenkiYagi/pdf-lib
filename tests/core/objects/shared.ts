import { PDFSecurity } from 'src/core/security/PDFSecurity.js';

/**
 * A `PDFSecurity` instance for testing.
 */
export const { security } = PDFSecurity.create(new Uint8Array([0]), {
  password: 'password',
});
