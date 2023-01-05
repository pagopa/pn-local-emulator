import crypto from 'crypto';
import { unsafeCoerce } from 'fp-ts/function';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRecord';
import { ConsumeEventStreamRecord } from '../ConsumeEventStreamRecord';
import { CreateEventStreamRecord } from '../CreateEventStreamRecord';
import { NewNotificationRecord } from '../NewNotificationRecord';
import { RecipientTypeEnum } from '../../generated/pnapi/NotificationRecipient';
import { SystemEnv } from '../../useCases/SystemEnv';
import { Logger, makeLogger } from '../../logger';
import * as inMemory from '../../adapters/inMemory';
import { config } from '../../__tests__/data';
import { LegalFactCategoryEnum } from '../../generated/pnapi/LegalFactCategory';
import { IUN } from '../../generated/pnapi/IUN';
import { TypeEnum } from '../../generated/pnapi/NotificationDigitalAddress';

export const apiKey = {
  valid: 'key-value',
  invalid: 'invalid-key-value',
};

export const notificationId = {
  valid: 'notification-id',
};

export const paProtocolNumber = {
  valid: 'paProtocolNumber',
};

export const idempotenceToken = {
  valid: 'idempotenceToken',
};

export const aIun = {
  valid: unsafeCoerce<string, IUN>('ILNK-HRTZ-CRNL-163785-I-2'),
  invalid: unsafeCoerce<string, IUN>('ILNK-HRTZ-CRNL-186985-I-2'),
};

export const streamId = {
  valid: aIun.valid,
};

export const aLegalFactId = 'aLegalFactId';

export const aLegalFactType = LegalFactCategoryEnum.ANALOG_DELIVERY;

export const aDate = new Date(0);

export const aSenderPaId = 'aSenderPaId';

export const anAttachmentRef = {
  key: 'key',
  versionToken: '123',
};

export const aSha256 = 'jezIVxlG1M1woCSUngM6KipUN3/p8cG5RMIPnuEanlE=';

export const aDocument0: NewNotificationRecord['input']['body']['documents'][0] = {
  docIdx: '0',
  digests: {
    sha256: aSha256,
  },
  contentType: 'application/pdf',
  ref: anAttachmentRef,
};

export const aDocument1 = {
  ...aDocument0,
  docIdx: '1',
  ref: {
    ...aDocument0.ref,
    key: 'key1',
  },
};

export const aRetryAfterMs = 1000;

export const aNotificationPrice = 100;

export const makeTestSystemEnv = (
  createNotificationRequestRecords: ReadonlyArray<NewNotificationRecord> = [],
  findNotificationRequestRecords: ReadonlyArray<CheckNotificationStatusRecord> = [],
  consumeEventStreamRecords: ReadonlyArray<ConsumeEventStreamRecord> = [],
  createEventStreamRecords: ReadonlyArray<CreateEventStreamRecord> = [],
  logger: Logger = makeLogger()
): SystemEnv => {
  return {
    uploadToS3URL: config.server.uploadToS3URL,
    downloadDocumentURL: new URL('http://localhost/downloaddocument'),
    sampleStaticPdfFileName: 'sample.pdf',
    occurrencesAfterComplete: 2,
    occurrencesAfterViewed: 4,
    senderPAId: aSenderPaId,
    retryAfterMs: aRetryAfterMs,
    notificationPrice: aNotificationPrice,
    iunGenerator: () => aIun.valid,
    dateGenerator: () => new Date(0),
    uuidGenerator: () => crypto.randomUUID(),
    recordRepository: inMemory.makeRecordRepository(logger)([
      ...createNotificationRequestRecords,
      ...findNotificationRequestRecords,
      ...consumeEventStreamRecords,
      ...createEventStreamRecords,
    ]),
  };
};

export const aRecipient: NewNotificationRecord['input']['body']['recipients'][0] = {
  recipientType: RecipientTypeEnum.PF,
  denomination: unsafeCoerce('denomination'),
  taxId: unsafeCoerce('aTaxId'),
  digitalDomicile: {
    type: TypeEnum.PEC,
    address: 'hello@thisismypec.pec',
  },
  physicalAddress: {
    address: '',
    zip: '',
    municipality: '',
  },
  payment: {
    creditorTaxId: unsafeCoerce('77777777777'),
    noticeCode: unsafeCoerce('302000100000019421'),
    pagoPaForm: {
      digests: {
        sha256: aSha256,
      },
      contentType: 'application/pdf',
      ref: anAttachmentRef,
    },
  },
};

export const aSecret = 'a-secret';
export const aUrl = 'a-url';
