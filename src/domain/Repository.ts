import * as TE from 'fp-ts/TaskEither';
import { NewNotificationRecord } from './NewNotificationRecord';
import { PreLoadRecord } from './PreLoadRecord';
import { UploadToS3Record } from './UploadToS3Record';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';
import { ConsumeEventStreamRecord } from './ConsumeEventStreamRecord';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { ListEventStreamRecord } from './ListEventStreamRecord';
import { GetNotificationDetailRecord } from './GetNotificationDetailRecord';
import { GetNotificationDocumentMetadataRecord } from './GetNotificationDocumentMetadataRecord';
import { GetNotificationPriceRecord } from './GetNotificationPriceRecord';
import { GetPaymentNotificationMetadataRecord } from './GetPaymentNotificationMetadataRecord';
import { LegalFactDownloadMetadataRecord } from './LegalFactDownloadMetadataRecord';

export type AuditRecord = {
  loggedAt: Date;
};

export type Record =
  | PreLoadRecord
  | UploadToS3Record
  | NewNotificationRecord
  | CheckNotificationStatusRecord
  | ConsumeEventStreamRecord
  | CreateEventStreamRecord
  | ListEventStreamRecord
  | GetNotificationDetailRecord
  | GetNotificationDocumentMetadataRecord
  | GetNotificationPriceRecord
  | GetPaymentNotificationMetadataRecord
  | LegalFactDownloadMetadataRecord;

export type RecordRepository = {
  insert: <A extends Record>(input: A) => TE.TaskEither<Error, A>;
  list: () => TE.TaskEither<Error, ReadonlyArray<Record>>;
};
