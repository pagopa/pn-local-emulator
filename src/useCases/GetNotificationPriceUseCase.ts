import * as RA from 'fp-ts/ReadonlyArray';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { ApiKey } from '../generated/definitions/ApiKey';
import {
  GetNotificationPriceRecord,
  makeGetNotificationPriceRecord,
} from '../domain/GetNotificationPriceRecordRepository';
import { computeSnapshot } from '../domain/Snapshot';
import { isNewNotificationRecord } from '../domain/NewNotificationRecord';
import { isCheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRecord';
import { isConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecordRepository';
import { SystemEnv } from './SystemEnv';

// TODO: Apply the Reader monad to the environment.
export const GetNotificationPriceUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey) =>
  (paTaxId: string) =>
  (noticeCode: string): TE.TaskEither<Error, GetNotificationPriceRecord['output']> =>
    pipe(
      TE.of(computeSnapshot(env)),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isNewNotificationRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isCheckNotificationStatusRecord)))),
      TE.ap(pipe(env.recordRepository.list(), TE.map(RA.filterMap(isConsumeEventStreamRecord)))),
      TE.map((snapshot) =>
        makeGetNotificationPriceRecord({
          ...env,
          request: { apiKey, paTaxId, noticeCode },
          snapshot,
        })
      ),
      // TE.chain(env.consumeEventStreamRecordRepository.insert),
      TE.map(({ output }) => output)
    );

export type GetNotificationPriceUseCase = ReturnType<typeof GetNotificationPriceUseCase>;
