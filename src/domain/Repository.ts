import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRecord } from './NewNotificationRecord';
import { PreLoadRecord } from './PreLoadRecord';
import { UploadToS3Record } from './UploadToS3Record';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';
import { ConsumeEventStreamRecord } from './ConsumeEventStreamRecord';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { ListEventStreamRecord } from './ListEventStreamRecord';

export type Repository<A> = {
  insert: (input: A) => TE.TaskEither<Error, A>;

  list: () => TE.TaskEither<Error, ReadonlyArray<A>>;
};

export type AuditRecord = {
  loggedAt: Date;
};

// TODO: Add missing records or find another solution
export type AllRecord =
  | Record
  | PreLoadRecord
  | UploadToS3Record
  | NewNotificationRecord
  | CreateEventStreamRecord
  | ConsumeEventStreamRecord;

export const existsApiKey = <T extends { input: { apiKey: ApiKey } }>(record: T) =>
  pipe(record.input.apiKey, O.fromNullable, O.isSome);

export type Record =
  | PreLoadRecord
  | UploadToS3Record
  | NewNotificationRecord
  | CheckNotificationStatusRecord
  | ConsumeEventStreamRecord
  | CreateEventStreamRecord
  | ListEventStreamRecord;

export type RecordRepository = {
  insert: <A extends Record>(input: A) => TE.TaskEither<Error, A>;
  list: () => TE.TaskEither<Error, ReadonlyArray<Record>>;
};
