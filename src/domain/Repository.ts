import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRecord } from './NewNotificationRepository';
import { PreLoadRecord } from './PreLoadRepository';
import { UploadToS3Record } from './UploadToS3RecordRepository';

export type Repository<A> = {
  insert: (input: A) => TE.TaskEither<Error, A>;

  list: () => TE.TaskEither<Error, ReadonlyArray<A>>;
};

export type AuditRecord = {
  loggedAt: Date;
};

// TODO: Add missing records or find another solution
export type AllRecord = PreLoadRecord | UploadToS3Record | NewNotificationRecord;

export const existsApiKey = <T extends { input: { apiKey: ApiKey } }>(record: T) =>
  pipe(record.input.apiKey, O.fromNullable, O.isSome);
