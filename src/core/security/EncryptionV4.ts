import type { EncryptionDict, Encryption } from 'src/core/security/Encryption';
import type { SecurityOptions } from 'src/core/security/PDFSecurity';
import {
  setupStdSecurityHandlerR4,
  StdSecurityHandlerDictR4,
} from './StdSecurityHandlerR4';

export interface EncryptionDictV4 extends EncryptionDict, StdSecurityHandlerDictR4 {}

export const setupEncryptionV4 = (
  firstId: Uint8Array,
  options: SecurityOptions,
): Encryption => {
  const { key, dict: shDict } = setupStdSecurityHandlerR4(
    firstId,
    options.ownerPassword,
  );

  const dictionary: EncryptionDictV4 = {
    Filter: 'Standard',
    V: 4,
    CF: {
      StdCF: {
        AuthEvent: 'DocOpen',
        CFM: 'AESV2',
      },
    },
    StmF: 'StdCF',
    StrF: 'StdCF',
    R: shDict.R,
    O: shDict.O,
    U: shDict.U,
    P: shDict.P,
  };

  return {
    key: key,
    dictionary,
  };
};
