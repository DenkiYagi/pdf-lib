# Modifications

## [1.17.1-mod.2023.2]

- Added encryption feature.
    - See: `PDFDocument#encrypt()`

## [1.17.1-mod.2023.1]

- Used `fontkit 2` instead of `@pdf-lib/fontkit`.
    - Removed `PDFDocument#registerFontkit()`. `fontkit` is included by default.
- Added vertical text option.
- Removed support for deno and react-native.
- Upgraded TypeScript version to 4.9.
    - Used `import type` and removed `export default` from internal packages.
