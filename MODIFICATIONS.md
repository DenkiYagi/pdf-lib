# Modifications

## [1.17.1-mod.2025.8]

### Feature Removals

- Remove WOFF/WOFF2/DFont support from `PDFDocument#embedFont` by updating `@denkiyagi/fontkit` to `2.0.4-mod.2025.4`;
  only `*.ttf` and `*.otf` font formats are now supported.
- Remove Base64 string/dataURI inputs across `PDFDocument` loading, embedding, and attachments;
  binary data must now be provided as `Uint8Array` or `ArrayBuffer`.
- Remove Base64 output by removing the `PDFDocument#saveAsBase64` method;
  use `PDFDocument#save` which resolves a `Uint8Array` instead.

### Error Handling

- Introduced `PDFLibError` (exported from `src/core`) with a machine-readable `type: PDFLibErrorType` to classify errors.
- Refactored API/core/utils errors so that all errors extend `PDFLibError` instead of throwing bare `Error`/`TypeError`.
- Normalize external failure surfaces by catching `@denkiyagi/fontkit` and `@pdf-lib/upng` exceptions and rethrowing corresponding `PDFLibError` subclasses (e.g., `InvalidFontDataError`) instead of leaking third-party errors.

### Internal Changes

- Update several devDependencies including `typescript` to their latest versions.

## [1.17.1-mod.2025.7]

- Add `PDFDocument#embedTTFFont` (subset-only) and `CustomFontSubsetEmbedder.forTTFFont` so pre-created fontkit `TTFFont` instances can be embedded.
- Refactor the internal custom font embedders into separate subset and non-subset implementations by adding the abstract base class `AbstractCustomFontEmbedder`.

## [1.17.1-mod.2025.6]

- Update `@denkiyagi/fontkit` to `2.0.4-mod.2025.2`, which enhances runtime performance for Unicode Variation Sequences (UVS) support.

## [1.17.1-mod.2025.5]

- Update `@denkiyagi/fontkit` to `2.0.4-mod.2025.1`, which improves Unicode Variation Sequences (UVS) support.

## [1.17.1-mod.2025.4]

- Changed npm dependency `fontkit` to `@denkiyagi/fontkit`
- Improved `options` parameter of `PDFDocument#embedFont`
- Fix `AbstractCustomFontEmbedder#embedCIDFontDict` so that it respects glyph metrics when embedding vertical fonts
- Add methods `PDFFont#getRawStandardFont` and `PDFFont#getRawCustomFont`
- Improve parameters of `PDFPage#drawText`:
    - Expand the data type of the `text` parameter so that it also accepts Glyph IDs instead of string
    - Add `fontLayoutAdvancedParams` property to the `options` parameter

## [1.17.1-mod.2025.1], [1.17.1-mod.2025.2], [1.17.1-mod.2025.3]

- (removed)

## [1.17.1-mod.2023.6]

- Upgraded `crypto-js`

## [1.17.1-mod.2023.5]

- (removed)

## [1.17.1-mod.2023.4]

- Added border-radius options to `PDFPage#drawRectangle()`

## [1.17.1-mod.2023.3]

- Added encryption feature: `PDFDocument#encrypt()`
- Changed the property `PDFDocument#isEncrypted` to a method as it is dynamic now.
- Enabled to create/update the document ID: `PDFDocument#updateId()`

## [1.17.1-mod.2023.2]

- (removed)

## [1.17.1-mod.2023.1]

- Used `fontkit 2` instead of `@pdf-lib/fontkit`.
    - Removed `PDFDocument#registerFontkit()`. `fontkit` is included by default.
- Added vertical text option.
- Removed support for deno and react-native.
- Upgraded TypeScript version to 4.9.
    - Used `import type` and removed `export default` from internal packages.
