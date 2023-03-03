// @ts-nocheck
// This file is for future implementations.

import type { EncryptionDict, Encryption } from 'src/core/security/Encryption';
import type { SecurityOptions } from 'src/core/security/PDFSecurity';
import {
  setupStdSecurityHandlerR5,
  StdSecurityHandlerDictR5,
} from './StdSecurityHandlerR5';

export interface EncryptionDictV5 extends EncryptionDict, StdSecurityHandlerDictR5 {}

export const setupEncryptionV5 = (options: SecurityOptions): Encryption => {
  const { key, dict: shDict } = setupStdSecurityHandlerR5(
    options.ownerPassword,
  );

  const dictionary: EncryptionDictV5 = {
    Filter: 'Standard',
    V: 5,
    CF: {
      StdCF: {
        AuthEvent: 'DocOpen',
        CFM: 'AESV3',
      },
    },
    StmF: 'StdCF',
    StrF: 'StdCF',
    R: shDict.R,
    O: shDict.O,
    OE: shDict.OE,
    U: shDict.U,
    UE: shDict.UE,
    P: shDict.P,
    Perms: shDict.Perms,
  };

  return {
    key: key,
    dictionary,
  };
};
