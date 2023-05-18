# Modifications

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
