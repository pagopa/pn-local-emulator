import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { GetNotificationPriceRecord, makeGetNotificationPriceRecord } from '../domain/GetNotificationPriceRecord';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

// TODO: Apply the Reader monad to the environment.
export const GetNotificationPriceUseCase =
  (env: SystemEnv) =>
  (apiKey: GetNotificationPriceRecord['input']['apiKey']) =>
  (paTaxId: GetNotificationPriceRecord['input']['paTaxId']) =>
  (
    noticeCode: GetNotificationPriceRecord['input']['noticeCode']
  ): TE.TaskEither<Error, GetNotificationPriceRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map(makeGetNotificationPriceRecord(env)({ apiKey, paTaxId, noticeCode })),
      TE.chain(env.recordRepository.insert),
      TE.map(({ output }) => output)
    );

export type GetNotificationPriceUseCase = ReturnType<typeof GetNotificationPriceUseCase>;
