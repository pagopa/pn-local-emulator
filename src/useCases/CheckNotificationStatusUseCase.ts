import * as t from 'io-ts';
import { pipe, flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { authorizeApiKey } from '../domain/authorize';
import { CheckNotificationStatusRecord } from '../domain/CheckNotificationStatusRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Snapshot, computeSnapshot } from '../domain/Snapshot';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import { SystemEnv } from './SystemEnv';

const findFromSnapshot = (input: CheckNotificationStatusRecord['input']) => (db: Snapshot) =>
  pipe(
    db,
    RA.findFirst(
      flow(E.toUnion, (notificationRequest) =>
        'notificationRequestId' in input
          ? notificationRequest.notificationRequestId === input.notificationRequestId
          : notificationRequest.paProtocolNumber === input.paProtocolNumber &&
            notificationRequest.idempotenceToken === input.idempotenceToken
      )
    )
  );

// TODO: Apply the Reader monad to the environment.
export const CheckNotificationStatusUseCase =
  (env: SystemEnv) =>
  (apiKey: ApiKey) =>
  (input: CheckNotificationStatusRecord['input']): TE.TaskEither<Error, CheckNotificationStatusRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(computeSnapshot(env)),
          TE.ap(env.createNotificationRequestRecordRepository.list()),
          TE.ap(env.findNotificationRequestRecordRepository.list()),
          TE.ap(env.consumeEventStreamRecordRepository.list()),
          TE.map(
            flow(
              findFromSnapshot(input),
              O.map(
                E.fold(
                  (nr) => ({ ...nr, notificationRequestStatus: 'WAITING' }),
                  (n) =>
                    t
                      .exact(NewNotificationRequestStatusResponse)
                      .encode({ ...n, notificationRequestStatus: 'ACCEPTED' })
                )
              ),
              O.map((response) => ({ statusCode: 200 as const, returned: response })),
              O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
            )
          )
        )
      ),
      E.sequence(TE.ApplicativePar),
      TE.map(
        flow(E.toUnion, (output) => ({
          type: 'CheckNotificationStatusRecord' as const,
          input,
          output,
          createdAt: env.dateGenerator(),
        }))
      ),
      TE.chain(env.findNotificationRequestRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type CheckNotificationStatusUseCase = ReturnType<typeof CheckNotificationStatusUseCase>;
