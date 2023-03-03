export type StdSecurityHandlerRevision = 4 | 5;

export interface StdSecurityHandlerDictBase {
  /**
   * Revision of the Standard Security Handler.
   */
  R: StdSecurityHandlerRevision;

  /**
   * Owner password entry.
   */
  O: Uint8Array;

  /**
   * User password entry.
   */
  U: Uint8Array;

  /**
   * Permission flags.
   */
  P: number;
}