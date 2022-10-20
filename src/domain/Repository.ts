import * as TE from 'fp-ts/TaskEither';
import { NewNotificationRecord } from './NewNotificationRepository';
import { PreLoadRecord } from './PreLoadRepository';
import { UploadToS3Record } from './UploadToS3RecordRepository';

export type Repository<A> = {
  insert: (input: A) => TE.TaskEither<Error, A>;

  list: () => TE.TaskEither<Error, ReadonlyArray<A>>;
};

// TODO: Add missing records or find another solution
export type AllRecord = PreLoadRecord | UploadToS3Record | NewNotificationRecord;
