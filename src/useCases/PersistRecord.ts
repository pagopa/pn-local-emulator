import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { Record } from '../domain/Repository';
import { DeleteStreamRecord } from '../domain/DeleteStreamRecord';
import { CreateEventStreamRecord } from '../domain/CreateEventStreamRecord';
// import { DeleteNotificationRecord } from '../domain/DeleteNotificationRecord';
import { SystemEnv } from './SystemEnv';

export const persistRecord =
  (env: SystemEnv) =>
  <R extends Record>(fn: (list: ReadonlyArray<Record>) => R) =>
    pipe(env.recordRepository.list(), TE.map(fn), TE.chain(env.recordRepository.insert));

export const deleteStreamRecord = (env: SystemEnv) => (recordToRemove: DeleteStreamRecord) =>
  pipe(env.recordRepository.removeStreamRecord(recordToRemove));

export const updateStreamRecord = (env: SystemEnv) => (recordToUpdate: CreateEventStreamRecord) =>
  pipe(env.recordRepository.updateStreamRecord(recordToUpdate));

export const updateStreamRecordReturningOnlyTheOneUpdatedStream =
  (env: SystemEnv) => (recordToUpdate: CreateEventStreamRecord) =>
    pipe(env.recordRepository.updateStreamRecordReturningOnlyTheOneUpdatedStream(recordToUpdate));

export const deleteNotificationRecord =
    (env: SystemEnv) =>
    <R extends Record>(fn: (list: ReadonlyArray<Record>) => R) =>
      pipe(env.recordRepository.list(), TE.map(fn), TE.chain(env.recordRepository.removeNotificationRecord));
