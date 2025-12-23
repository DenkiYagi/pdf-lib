import type { Shaper } from '@denkiyagi/fontkit';
import type { EmbeddedFileOptions } from 'src/core/embedders/FileEmbedder.js';

export enum ParseSpeeds {
  Fastest = Infinity,
  Fast = 1500,
  Medium = 500,
  Slow = 100,
}

export interface AttachmentOptions extends EmbeddedFileOptions {}
export { AFRelationship } from 'src/core/embedders/FileEmbedder.js';

export interface SaveOptions {
  useObjectStreams?: boolean;
  addDefaultPage?: boolean;
  objectsPerTick?: number;
  updateFieldAppearances?: boolean;
}

export interface LoadOptions {
  ignoreEncryption?: boolean;
  parseSpeed?: ParseSpeeds | number;
  throwOnInvalidObject?: boolean;
  updateMetadata?: boolean;
  capNumbers?: boolean;
}

export interface CreateOptions {
  updateMetadata?: boolean;
}

export interface EmbedFontOptions {
  subset?: boolean;
  customName?: string;
  vertical?: boolean;
  advanced?: EmbedFontAdvancedOptions;
}

export interface EmbedFontAdvancedOptions {
  /**
   * [Features](https://learn.microsoft.com/en-us/typography/opentype/spec/featurelist) to override.
   */
  fontFeatures?: Record<string, boolean>;

  /**
   * Any [Script tag](https://learn.microsoft.com/en-us/typography/opentype/spec/scripttags).
   */
  script?: string;

  /**
   * Any [Language tag](https://learn.microsoft.com/en-us/typography/opentype/spec/languagetags).
   */
  language?: string;

  direction?: 'ltr' | 'rtl';

  /**
   * You may choose one of preset shapers (e.g. `HorizontalPresetShaper`) that `pdf-lib` provides,
   * or make your own that satisfies the `Shaper` type of `fontkit`,
   * or do not specify to let it go with the `fontkit` default behavior.
   */
  shaper?: Shaper;
}

export interface SetTitleOptions {
  showInWindowTitleBar: boolean;
}
