import {
  AssertionError as FontkitAssertionError,
  create as createFont,
} from '@denkiyagi/fontkit';
import type {
  BBox,
  Glyph,
  GlyphRun,
  Subset,
  TTFFont,
} from '@denkiyagi/fontkit';
import {
  Duplex,
  NonFullScreenPageMode,
  PrintScaling,
  ReadingDirection,
  ViewerPreferences,
} from 'src/core/interactive/ViewerPreferences.js';
import { PDFArray } from 'src/core/objects/PDFArray.js';
import { PDFDict } from 'src/core/objects/PDFDict.js';
import { PDFHexString } from 'src/core/objects/PDFHexString.js';
import { PDFName } from 'src/core/objects/PDFName.js';
import { PDFRef } from 'src/core/objects/PDFRef.js';
import {
  EncryptedPDFError,
  InvalidFontSubsetOptionError,
} from 'src/api/errors.js';
import { ParseSpeeds } from 'src/api/PDFDocumentOptions.js';
import { PDFDocument } from 'src/api/PDFDocument.js';
import { PDFPage } from 'src/api/PDFPage.js';
import { PDFFont } from 'src/api/PDFFont.js';
import {
  InvalidIndirectObjectError,
  FontkitAssertionError as PDFLibFontkitAssertionError,
  UnsupportedFontFileFormatError,
} from 'src/core/errors.js';
import { PDFSecurity, SecurityOptions } from 'src/core/security/PDFSecurity.js';
import { readBinaryFileSync } from '../test-utils.js';
import { InvalidPngError } from 'src/utils/errors.js';

const examplePngImage = readBinaryFileSync('assets/images/etwe.png');

const unencryptedPdfBytes = readBinaryFileSync('assets/pdfs/normal.pdf');
const oldEncryptedPdfBytes1 = readBinaryFileSync(
  'assets/pdfs/encrypted_old.pdf',
);

// Had to remove this file due to DMCA complaint, so commented this line out
// along with the 2 tests that depend on it. Would be nice to find a new file
// that we could drop in here, but the tests are for non-critical functionality,
// so this solution is okay for now.
// const oldEncryptedPdfBytes2 = readBinaryFileSync('pdf_specification.pdf');

const newEncryptedPdfBytes = readBinaryFileSync(
  'assets/pdfs/encrypted_new.pdf',
);
const invalidObjectsPdfBytes = readBinaryFileSync(
  'assets/pdfs/with_invalid_objects.pdf',
);
const justMetadataPdfbytes = readBinaryFileSync(
  'assets/pdfs/just_metadata.pdf',
);
const normalPdfBytes = readBinaryFileSync('assets/pdfs/normal.pdf');
const withViewerPrefsPdfBytes = readBinaryFileSync(
  'assets/pdfs/with_viewer_prefs.pdf',
);
const ubuntuFontBytes = readBinaryFileSync('assets/fonts/ubuntu/Ubuntu-B.ttf');

/**
 * Build a lightweight stub `TTFFont` for tests, with optional overrides for specific methods.
 * This is not a valid font—it's just enough shape to drive error mapping and guard coverage.
 */
const makeStubTTFFont = (overrides: Partial<TTFFont> = {}): TTFFont => {
  const glyph: Partial<Glyph> = {
    id: 1,
    advanceWidth: 0,
    advanceHeight: 0,
    vertOriginY: 0,
  };
  const subset: Subset = {
    type: 'TTF',
    font: undefined as unknown as TTFFont,
    glyphs: [],
    mapping: {},
    includeGlyph: vi.fn().mockReturnValue(1),
    encode: vi.fn().mockReturnValue(new Uint8Array()),
  };
  const layout = vi.fn(
    (): Partial<GlyphRun> => ({
      glyphs: [glyph as Glyph],
      positions: null,
      script: null,
      language: null,
      direction: 'ltr',
      features: {},
    }),
  );
  const bbox: Partial<BBox> = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
  };
  const baseFont: Partial<TTFFont> = {
    type: 'TTF',
    unitsPerEm: 1000,
    postscriptName: 'FakeFont',
    characterSet: [],
    bbox: bbox as BBox,
    head: { macStyle: { italic: false } },
    post: { isFixedPitch: false },
    layout: layout as TTFFont['layout'],
    getGlyph: vi.fn(() => glyph as Glyph),
    glyphForCodePoint: vi.fn(() => glyph as Glyph),
    createSubset: (() => subset) as TTFFont['createSubset'],
    defaultVertOriginY: 0,
    cff: false,
    ascent: 0,
    descent: 0,
    italicAngle: 0,
    capHeight: 0,
    xHeight: 0,
  };

  subset.font = baseFont as TTFFont;

  return { ...baseFont, ...overrides } as TTFFont;
};

describe(`PDFDocument`, () => {
  describe(`load() method`, () => {
    const origConsoleWarn = console.warn;

    beforeAll(() => {
      const ignoredWarnings = [
        'Trying to parse invalid object:',
        'Invalid object ref:',
      ];
      console.warn = vi.fn((...args) => {
        const isIgnored = ignoredWarnings.find((iw) => args[0].includes(iw));
        if (!isIgnored) origConsoleWarn(...args);
      });
    });

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterAll(() => {
      console.warn = origConsoleWarn;
    });

    it(`does not throw an error for unencrypted PDFs`, async () => {
      const pdfDoc = await PDFDocument.load(unencryptedPdfBytes, {
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted()).toBe(false);
    });

    it(`throws an error for old encrypted PDFs (1)`, async () => {
      await expect(
        PDFDocument.load(oldEncryptedPdfBytes1, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    // it(`throws an error for old encrypted PDFs (2)`, async () => {
    //   await expect(
    //     PDFDocument.load(oldEncryptedPdfBytes2, {
    //       parseSpeed: ParseSpeeds.Fastest,
    //     }),
    //   ).rejects.toThrow(new EncryptedPDFError());
    // });

    it(`throws an error for new encrypted PDFs`, async () => {
      await expect(
        PDFDocument.load(newEncryptedPdfBytes, {
          parseSpeed: ParseSpeeds.Fastest,
        }),
      ).rejects.toThrow(new EncryptedPDFError());
    });

    it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (1)`, async () => {
      const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes1, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted()).toBe(true);
    });

    // it(`does not throw an error for old encrypted PDFs when ignoreEncryption=true (2)`, async () => {
    //   const pdfDoc = await PDFDocument.load(oldEncryptedPdfBytes2, {
    //     ignoreEncryption: true,
    //     parseSpeed: ParseSpeeds.Fastest,
    //   });
    //   expect(pdfDoc).toBeInstanceOf(PDFDocument);
    //   expect(pdfDoc.isEncrypted()).toBe(true);
    // });

    it(`does not throw an error for new encrypted PDFs when ignoreEncryption=true`, async () => {
      const pdfDoc = await PDFDocument.load(newEncryptedPdfBytes, {
        ignoreEncryption: true,
        parseSpeed: ParseSpeeds.Fastest,
      });
      expect(pdfDoc).toBeInstanceOf(PDFDocument);
      expect(pdfDoc.isEncrypted()).toBe(true);
    });

    it(`does not throw an error for invalid PDFs when throwOnInvalidObject=false`, async () => {
      await expect(
        PDFDocument.load(invalidObjectsPdfBytes, {
          ignoreEncryption: true,
          parseSpeed: ParseSpeeds.Fastest,
          throwOnInvalidObject: false,
        }),
      ).resolves.toBeInstanceOf(PDFDocument);
    });

    it(`throws an error for invalid PDFs when throwOnInvalidObject=true`, async () => {
      await expect(
        PDFDocument.load(invalidObjectsPdfBytes, {
          ignoreEncryption: true,
          parseSpeed: ParseSpeeds.Fastest,
          throwOnInvalidObject: true,
        }),
      ).rejects.toThrow(InvalidIndirectObjectError);
    });
  });

  describe(`embedFont() method`, () => {
    it(`serializes the same value on every save`, async () => {
      const customFont = new Uint8Array(ubuntuFontBytes);
      const pdfDoc1 = await PDFDocument.create({ updateMetadata: false });
      const pdfDoc2 = await PDFDocument.create({ updateMetadata: false });

      await pdfDoc1.embedFont(customFont);
      await pdfDoc2.embedFont(customFont);

      const savedDoc1 = await pdfDoc1.save();
      const savedDoc2 = await pdfDoc2.save();

      expect(savedDoc1).toEqual(savedDoc2);
    });

    it(`supports embedding TTFFont instances when subset=true`, async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      const ttFont = createFont(new Uint8Array(ubuntuFontBytes)) as TTFFont;

      expect(pdfDoc.embedTTFFont(ttFont, { subset: true })).toBeInstanceOf(
        PDFFont,
      );
    });

    it(`rejects TTFFont instances when subset is undefined`, async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      const ttFont = createFont(new Uint8Array(ubuntuFontBytes)) as TTFFont;

      expect(() => pdfDoc.embedTTFFont(ttFont, {})).toThrow(
        InvalidFontSubsetOptionError,
      );
    });

    it(`rejects TTFFont instances when subset is false`, async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      const ttFont = createFont(new Uint8Array(ubuntuFontBytes)) as TTFFont;

      expect(() => pdfDoc.embedTTFFont(ttFont, { subset: false })).toThrow(
        InvalidFontSubsetOptionError,
      );
    });

    it(`rejects buffer data that is not a font`, async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });

      expect(() => pdfDoc.embedFont(examplePngImage)).toThrow(
        UnsupportedFontFileFormatError,
      );
    });

    it(`maps fontkit errors thrown during embedding TTFFont`, async () => {
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      const fontkitError = new FontkitAssertionError('boom');
      const ttFont = makeStubTTFFont({
        createSubset: () => {
          throw fontkitError;
        },
      });

      expect(() => pdfDoc.embedTTFFont(ttFont, { subset: true })).toThrow(
        PDFLibFontkitAssertionError,
      );
    });

    it(`maps fontkit errors thrown while encoding text`, async () => {
      const layoutError = new FontkitAssertionError('layout fail');
      const subset = {
        type: 'TTF',
        includeGlyph: vi.fn().mockReturnValue(1),
        encode: vi.fn().mockReturnValue(new Uint8Array()),
      };
      const ttFont = makeStubTTFFont({
        createSubset: (() => subset) as unknown as TTFFont['createSubset'],
        layout: () => {
          throw layoutError;
        },
      });
      const pdfDoc = await PDFDocument.create({ updateMetadata: false });
      const pdfFont = pdfDoc.embedTTFFont(ttFont, { subset: true });

      expect(() => pdfFont.encodeText('Hi')).toThrow(
        PDFLibFontkitAssertionError,
      );
    });
  });

  describe(`setLanguage() method`, () => {
    it(`sets the language of the document`, async () => {
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.catalog.get(PDFName.of('Lang'))).toBeUndefined();

      pdfDoc.setLanguage('fr-FR');
      expect(String(pdfDoc.catalog.get(PDFName.of('Lang')))).toBe('(fr-FR)');

      pdfDoc.setLanguage('en');
      expect(String(pdfDoc.catalog.get(PDFName.of('Lang')))).toBe('(en)');

      pdfDoc.setLanguage('');
      expect(String(pdfDoc.catalog.get(PDFName.of('Lang')))).toBe('()');
    });
  });

  describe(`getPageCount() method`, () => {
    let pdfDoc: PDFDocument;
    beforeAll(async () => {
      const parseSpeed = ParseSpeeds.Fastest;
      pdfDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
    });

    it(`returns the initial page count of the document`, () => {
      expect(pdfDoc.getPageCount()).toBe(2);
    });

    it(`returns the updated page count after adding pages`, () => {
      pdfDoc.addPage();
      pdfDoc.addPage();
      expect(pdfDoc.getPageCount()).toBe(4);
    });

    it(`returns the updated page count after inserting pages`, () => {
      pdfDoc.insertPage(0);
      pdfDoc.insertPage(4);
      expect(pdfDoc.getPageCount()).toBe(6);
    });

    it(`returns the updated page count after removing pages`, () => {
      pdfDoc.removePage(5);
      pdfDoc.removePage(0);
      expect(pdfDoc.getPageCount()).toBe(4);
    });

    it(`returns 0 for brand new documents`, async () => {
      const newDoc = await PDFDocument.create();
      expect(newDoc.getPageCount()).toBe(0);
    });
  });

  describe(`addPage() method`, () => {
    it(`Can insert pages in brand new documents`, async () => {
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.addPage()).toBeInstanceOf(PDFPage);
    });
  });

  describe(`metadata getter methods`, () => {
    it(`they can retrieve the title, author, subject, producer, creator, keywords, creation date, and modification date from a new document`, async () => {
      const pdfDoc = await PDFDocument.create();

      // Everything is empty or has its initial value.
      expect(pdfDoc.getTitle()).toBeUndefined();
      expect(pdfDoc.getAuthor()).toBeUndefined();
      expect(pdfDoc.getSubject()).toBeUndefined();
      expect(pdfDoc.getProducer()).toBe(
        'pdf-lib (https://github.com/Hopding/pdf-lib)',
      );
      expect(pdfDoc.getCreator()).toBe(
        'pdf-lib (https://github.com/Hopding/pdf-lib)',
      );
      expect(pdfDoc.getKeywords()).toBeUndefined();
      // Dates can not be tested since they have the current time as value.

      const title = '🥚 The Life of an Egg 🍳';
      const author = 'Humpty Dumpty';
      const subject = '📘 An Epic Tale of Woe 📖';
      const keywords = ['eggs', 'wall', 'fall', 'king', 'horses', 'men', '🥚'];
      const producer = 'PDF App 9000 🤖';
      const creator = 'PDF App 8000 🤖';

      // Milliseconds  will not get saved, so these dates do not have milliseconds.
      const creationDate = new Date('1997-08-15T01:58:37Z');
      const modificationDate = new Date('2018-12-21T07:00:11Z');

      pdfDoc.setTitle(title);
      pdfDoc.setAuthor(author);
      pdfDoc.setSubject(subject);
      pdfDoc.setKeywords(keywords);
      pdfDoc.setProducer(producer);
      pdfDoc.setCreator(creator);
      pdfDoc.setCreationDate(creationDate);
      pdfDoc.setModificationDate(modificationDate);

      expect(pdfDoc.getTitle()).toBe(title);
      expect(pdfDoc.getAuthor()).toBe(author);
      expect(pdfDoc.getSubject()).toBe(subject);
      expect(pdfDoc.getProducer()).toBe(producer);
      expect(pdfDoc.getCreator()).toBe(creator);
      expect(pdfDoc.getKeywords()).toBe(keywords.join(' '));
      expect(pdfDoc.getCreationDate()).toStrictEqual(creationDate);
      expect(pdfDoc.getModificationDate()).toStrictEqual(modificationDate);
    });

    it(`they can retrieve the title, author, subject, producer, creator, and keywords from an existing document`, async () => {
      const pdfDoc = await PDFDocument.load(justMetadataPdfbytes);

      expect(pdfDoc.getTitle()).toBe(
        'Title metadata (StringType=HexString, Encoding=PDFDocEncoding) with some weird chars ˘•€',
      );
      expect(pdfDoc.getAuthor()).toBe(
        'Author metadata (StringType=HexString, Encoding=UTF-16BE) with some chinese 你怎么敢',
      );
      expect(pdfDoc.getSubject()).toBe(
        'Subject metadata (StringType=LiteralString, Encoding=UTF-16BE) with some chinese 你怎么敢',
      );
      expect(pdfDoc.getProducer()).toBe(
        'pdf-lib (https://github.com/Hopding/pdf-lib)',
      );
      expect(pdfDoc.getKeywords()).toBe(
        'Keywords metadata (StringType=LiteralString, Encoding=PDFDocEncoding) with  some weird  chars ˘•€',
      );
    });

    it(`they can retrieve the creation date and modification date from an existing document`, async () => {
      const pdfDoc = await PDFDocument.load(normalPdfBytes, {
        updateMetadata: false,
      });

      expect(pdfDoc.getCreationDate()).toEqual(
        new Date('2018-01-04T01:05:06.000Z'),
      );
      expect(pdfDoc.getModificationDate()).toEqual(
        new Date('2018-01-04T01:05:06.000Z'),
      );
    });
  });

  describe(`ViewerPreferences`, () => {
    it(`defaults to an undefined ViewerPreferences dict`, async () => {
      const pdfDoc = await PDFDocument.create();

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      ).toBeUndefined();
    });

    it(`can get/set HideToolbar, HideMenubar, HideWindowUI, FitWindow, CenterWindow, DisplayDocTitle, NonFullScreenPageMode, Direction, PrintScaling, Duplex, PickTrayByPDFSize, PrintPageRange, NumCopies from a new document`, async () => {
      const pdfDoc = await PDFDocument.create();
      const viewerPrefs = pdfDoc.catalog.getOrCreateViewerPreferences();

      // Everything is empty or has its initial value.
      expect(viewerPrefs.getHideToolbar()).toBe(false);
      expect(viewerPrefs.getHideMenubar()).toBe(false);
      expect(viewerPrefs.getHideWindowUI()).toBe(false);
      expect(viewerPrefs.getFitWindow()).toBe(false);
      expect(viewerPrefs.getCenterWindow()).toBe(false);
      expect(viewerPrefs.getDisplayDocTitle()).toBe(false);
      expect(viewerPrefs.getNonFullScreenPageMode()).toBe(
        NonFullScreenPageMode.UseNone,
      );
      expect(viewerPrefs.getReadingDirection()).toBe(ReadingDirection.L2R);
      expect(viewerPrefs.getPrintScaling()).toBe(PrintScaling.AppDefault);
      expect(viewerPrefs.getDuplex()).toBeUndefined();
      expect(viewerPrefs.getPickTrayByPDFSize()).toBeUndefined();
      expect(viewerPrefs.getPrintPageRange()).toEqual([]);
      expect(viewerPrefs.getNumCopies()).toBe(1);

      const pageRanges = [
        { start: 0, end: 0 },
        { start: 2, end: 2 },
        { start: 4, end: 6 },
      ];

      viewerPrefs.setHideToolbar(true);
      viewerPrefs.setHideMenubar(true);
      viewerPrefs.setHideWindowUI(true);
      viewerPrefs.setFitWindow(true);
      viewerPrefs.setCenterWindow(true);
      viewerPrefs.setDisplayDocTitle(true);
      viewerPrefs.setNonFullScreenPageMode(NonFullScreenPageMode.UseOutlines);
      viewerPrefs.setReadingDirection(ReadingDirection.R2L);
      viewerPrefs.setPrintScaling(PrintScaling.None);
      viewerPrefs.setDuplex(Duplex.DuplexFlipLongEdge);
      viewerPrefs.setPickTrayByPDFSize(true);
      viewerPrefs.setPrintPageRange(pageRanges);
      viewerPrefs.setNumCopies(2);

      expect(viewerPrefs.getHideToolbar()).toBe(true);
      expect(viewerPrefs.getHideMenubar()).toBe(true);
      expect(viewerPrefs.getHideWindowUI()).toBe(true);
      expect(viewerPrefs.getFitWindow()).toBe(true);
      expect(viewerPrefs.getCenterWindow()).toBe(true);
      expect(viewerPrefs.getDisplayDocTitle()).toBe(true);
      expect(viewerPrefs.getNonFullScreenPageMode()).toBe(
        NonFullScreenPageMode.UseOutlines,
      );
      expect(viewerPrefs.getReadingDirection()).toBe(ReadingDirection.R2L);
      expect(viewerPrefs.getPrintScaling()).toBe(PrintScaling.None);
      expect(viewerPrefs.getDuplex()).toBe(Duplex.DuplexFlipLongEdge);
      expect(viewerPrefs.getPickTrayByPDFSize()).toBe(true);
      expect(viewerPrefs.getPrintPageRange()).toEqual(pageRanges);
      expect(viewerPrefs.getNumCopies()).toBe(2);

      // Test setting single page range
      const pageRange = { start: 2, end: 4 };
      viewerPrefs.setPrintPageRange(pageRange);
      expect(viewerPrefs.getPrintPageRange()).toEqual([pageRange]);
    });

    it(`they can be retrieved from an existing document`, async () => {
      const pdfDoc = await PDFDocument.load(withViewerPrefsPdfBytes);
      const viewerPrefs = pdfDoc.catalog.getViewerPreferences()!;

      expect(viewerPrefs).toBeInstanceOf(ViewerPreferences);
      expect(viewerPrefs.getPrintScaling()).toBe(PrintScaling.None);
      expect(viewerPrefs.getDuplex()).toBe(Duplex.DuplexFlipLongEdge);
      expect(viewerPrefs.getPickTrayByPDFSize()).toBe(true);
      expect(viewerPrefs.getPrintPageRange()).toEqual([
        { start: 1, end: 1 },
        { start: 3, end: 4 },
      ]);
      expect(viewerPrefs.getNumCopies()).toBe(2);

      expect(viewerPrefs.getFitWindow()).toBe(true);
      expect(viewerPrefs.getCenterWindow()).toBe(true);
      expect(viewerPrefs.getDisplayDocTitle()).toBe(true);
      expect(viewerPrefs.getHideMenubar()).toBe(true);
      expect(viewerPrefs.getHideToolbar()).toBe(true);

      /*
       * Other presets not tested, but defined in this PDF doc (Acrobat XI v11):
       * Binding: RightEdge
       * Language: EN-NZ
       *
       * NavigationTab: PageOnly
       * PageLayout: TwoUp (facing)
       * Magnification: 50%
       * OpenToPage: 2
       *
       * PageMode: FullScreen
       */
    });
  });

  describe(`setTitle() method with options`, () => {
    it(`does not set the ViewerPreferences dict if the option is not set`, async () => {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle('Testing setTitle Title');

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      ).toBeUndefined();

      expect(pdfDoc.getTitle()).toBe('Testing setTitle Title');
    });

    it(`creates the ViewerPreferences dict when the option is set`, async () => {
      const pdfDoc = await PDFDocument.create();

      pdfDoc.setTitle('ViewerPrefs Test Creation', {
        showInWindowTitleBar: true,
      });

      expect(
        pdfDoc.catalog.lookupMaybe(PDFName.of('ViewerPreferences'), PDFDict),
      );
    });
  });

  describe(`addJavaScript() method`, () => {
    it(`adds the script to the catalog`, async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addJavaScript(
        'main',
        'console.show(); console.println("Hello World");',
      );
      await pdfDoc.flush();

      expect(pdfDoc.catalog.has(PDFName.of('Names')));
      const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);
      expect(Names.has(PDFName.of('JavaScript')));
      const Javascript = Names.lookup(PDFName.of('JavaScript'), PDFDict);
      expect(Javascript.has(PDFName.of('Names')));
      const JSNames = Javascript.lookup(PDFName.of('Names'), PDFArray);
      expect(JSNames.lookup(0, PDFHexString).decodeText()).toEqual('main');
    });

    it(`does not overwrite scripts`, async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addJavaScript(
        'first',
        'console.show(); console.println("First");',
      );
      pdfDoc.addJavaScript(
        'second',
        'console.show(); console.println("Second");',
      );
      await pdfDoc.flush();

      const Names = pdfDoc.catalog.lookup(PDFName.of('Names'), PDFDict);
      const Javascript = Names.lookup(PDFName.of('JavaScript'), PDFDict);
      const JSNames = Javascript.lookup(PDFName.of('Names'), PDFArray);
      expect(JSNames.lookup(0, PDFHexString).decodeText()).toEqual('first');
      expect(JSNames.lookup(2, PDFHexString).decodeText()).toEqual('second');
    });
  });

  describe(`embedPng() method`, () => {
    it(`does not prevent the PDFDocument from being modified after embedding an image`, async () => {
      const pdfDoc = await PDFDocument.create();
      const pdfPage = pdfDoc.addPage();

      const noErrorFunc = async () => {
        const embeddedImage = await pdfDoc.embedPng(examplePngImage);
        pdfPage.drawImage(embeddedImage);
        await embeddedImage.embed();

        const pdfPage2 = pdfDoc.addPage();
        pdfPage2.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test');
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });

    it(`throws an error when the provided data is not a PNG`, async () => {
      const pdfDoc = await PDFDocument.create();

      await expect(pdfDoc.embedPng(ubuntuFontBytes)).rejects.toThrow(
        InvalidPngError,
      );
    });

    it(`throws an error when the PNG data is truncated`, async () => {
      const pdfDoc = await PDFDocument.create();
      const truncatedPng = examplePngImage.slice(
        0,
        Math.floor(examplePngImage.length / 2),
      );

      await expect(pdfDoc.embedPng(truncatedPng)).rejects.toThrow(
        InvalidPngError,
      );
    });
  });

  describe(`save() method`, () => {
    it(`can called multiple times on the same PDFDocument with different changes`, async () => {
      const pdfDoc = await PDFDocument.create();
      const embeddedImage = await pdfDoc.embedPng(examplePngImage);

      const noErrorFunc = async () => {
        const page1 = pdfDoc.addPage();
        page1.drawImage(embeddedImage);

        const pdfBytes1 = await pdfDoc.save();
        expect(pdfBytes1.byteLength).toBeGreaterThan(0);

        const page2 = pdfDoc.addPage();
        page2.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test');

        const pdfBytes2 = await pdfDoc.save();
        expect(pdfBytes2.byteLength).toBeGreaterThan(0);
        expect(pdfBytes2.byteLength).not.toEqual(pdfBytes1.byteLength);

        const pdfPage3 = pdfDoc.addPage();
        pdfPage3.drawImage(embeddedImage);

        pdfDoc.setTitle('Unit Test 2. change');

        const pdfBytes3 = await pdfDoc.save();
        expect(pdfBytes3.byteLength).toBeGreaterThan(0);
        expect(pdfBytes3.byteLength).not.toEqual(pdfBytes2.byteLength);
      };

      await expect(noErrorFunc()).resolves.not.toThrowError();
    });
  });

  describe(`copy() method`, () => {
    let pdfDoc: PDFDocument;
    let srcDoc: PDFDocument;
    beforeAll(async () => {
      const parseSpeed = ParseSpeeds.Fastest;
      srcDoc = await PDFDocument.load(unencryptedPdfBytes, { parseSpeed });
      const title = '🥚 The Life of an Egg 🍳';
      const author = 'Humpty Dumpty';
      const subject = '📘 An Epic Tale of Woe 📖';
      const keywords = ['eggs', 'wall', 'fall', 'king', 'horses', 'men', '🥚'];
      const producer = 'PDF App 9000 🤖';
      const creator = 'PDF App 8000 🤖';

      // Milliseconds  will not get saved, so these dates do not have milliseconds.
      const creationDate = new Date('1997-08-15T01:58:37Z');
      const modificationDate = new Date('2018-12-21T07:00:11Z');

      srcDoc.setTitle(title);
      srcDoc.setAuthor(author);
      srcDoc.setSubject(subject);
      srcDoc.setKeywords(keywords);
      srcDoc.setProducer(producer);
      srcDoc.setCreator(creator);
      srcDoc.setCreationDate(creationDate);
      srcDoc.setModificationDate(modificationDate);
      pdfDoc = await srcDoc.copy();
    });

    it(`Returns a pdf with the same number of pages`, async () => {
      expect(pdfDoc.getPageCount()).toBe(srcDoc.getPageCount());
    });

    it(`Can copy author, creationDate, creator, producer, subject, title, defaultWordBreaks`, async () => {
      expect(pdfDoc.getAuthor()).toBe(srcDoc.getAuthor());
      expect(pdfDoc.getCreationDate()).toStrictEqual(srcDoc.getCreationDate());
      expect(pdfDoc.getCreator()).toBe(srcDoc.getCreator());
      expect(pdfDoc.getModificationDate()).toStrictEqual(
        srcDoc.getModificationDate(),
      );
      expect(pdfDoc.getProducer()).toBe(srcDoc.getProducer());
      expect(pdfDoc.getSubject()).toBe(srcDoc.getSubject());
      expect(pdfDoc.getTitle()).toBe(srcDoc.getTitle());
      expect(pdfDoc.defaultWordBreaks).toEqual(srcDoc.defaultWordBreaks);
    });
  });

  describe(`updateId() method`, () => {
    let pdfDoc: PDFDocument;
    beforeAll(async () => {
      pdfDoc = await PDFDocument.create();
    });

    it(`Generates a new ID if no ID exists`, () => {
      const ret = pdfDoc.updateId();
      const { ID } = pdfDoc.context.trailerInfo;

      expect(ret.length).toBe(2);
      expect(ret[0]).toBeInstanceOf(Uint8Array);
      expect(ret[0]).toEqual(ret[1]);
      if (!(ID instanceof PDFArray)) {
        assert.fail(`ID is not an instance of PDFArray`);
      }
      expect(ID.size()).toBe(2);
      expect(ID.get(0)).toBeInstanceOf(PDFHexString);
      expect(ID.get(0)).toEqual(ID.get(1));
    });

    it(`Updates only the second element of the ID array if an ID already exists`, () => {
      const { ID: originalID } = pdfDoc.context.trailerInfo;
      if (!(originalID instanceof PDFArray)) assert.fail(`Invalid ID entry`);

      const ret = pdfDoc.updateId();
      const { ID: newID } = pdfDoc.context.trailerInfo;

      expect(ret.length).toBe(2);
      expect(ret[0]).toBeInstanceOf(Uint8Array);
      expect(ret[1]).toBeInstanceOf(Uint8Array);
      expect(ret[0]).not.toEqual(ret[1]);
      if (!(newID instanceof PDFArray)) {
        assert.fail(`ID is not an instance of PDFArray`);
      }
      expect(newID.size()).toBe(2);
      expect(newID.get(0)).toEqual(originalID.get(0));
      expect(newID.get(1)).not.toEqual(originalID.get(1));
    });
  });

  describe(`encrypt() method`, () => {
    const options: SecurityOptions = { password: 'password' };
    let pdfDoc: PDFDocument;
    beforeEach(async () => {
      pdfDoc = await PDFDocument.create();
    });

    it(`Updates the ID`, () => {
      const { ID: originalID } = pdfDoc.context.trailerInfo;

      pdfDoc.encrypt(options);

      expect(pdfDoc.context.trailerInfo.ID).not.toEqual(originalID);
    });

    it(`Sets the Encrypt entry`, () => {
      expect(pdfDoc.context.trailerInfo.Encrypt).toBe(undefined);

      pdfDoc.encrypt(options);

      const { Encrypt } = pdfDoc.context.trailerInfo;
      expect(Encrypt).toBeInstanceOf(PDFRef);
      expect(pdfDoc.context.lookup(Encrypt)).toBeInstanceOf(PDFDict);
    });

    it(`Sets the security property of the context`, () => {
      expect(pdfDoc.context.security).toBe(null);

      pdfDoc.encrypt(options);

      expect(pdfDoc.context.security).toBeInstanceOf(PDFSecurity);
    });

    it(`Changes the return value of isEncrypted() to true`, () => {
      expect(pdfDoc.isEncrypted()).toBe(false);

      pdfDoc.encrypt(options);

      expect(pdfDoc.isEncrypted()).toBe(true);
    });

    it(`Has no effect if the document is already encrypted`, () => {
      pdfDoc.encrypt(options); // first time

      const { ID: originalID, Encrypt: originalEncrypt } =
        pdfDoc.context.trailerInfo;
      const { security: originalSecurity } = pdfDoc.context;

      pdfDoc.encrypt(options); // second time

      const { ID: newID, Encrypt: newEncrypt } = pdfDoc.context.trailerInfo;
      const { security: newSecurity } = pdfDoc.context;
      expect(newID).toEqual(originalID);
      expect(newEncrypt).toEqual(originalEncrypt);
      expect(newSecurity).toEqual(originalSecurity);
    });
  });
});
