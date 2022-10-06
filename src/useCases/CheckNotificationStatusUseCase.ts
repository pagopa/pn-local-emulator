import * as crypto from 'crypto';
import * as t from 'io-ts';
import { pipe, flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { authorizeApiKey } from '../domain/authorize';
import {
  CheckNotificationStatusRecord,
  CheckNotificationStatusRecordRepository,
} from '../domain/CheckNotificationStatusRepository';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';
import { Snapshot, computeSnapshot } from '../domain/Snapshot';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';

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

export const CheckNotificationStatusUseCase =
  (
    occurencesAfterComplete: number,
    senderPAId: string,
    createNotificationRequestRecordRepository: NewNotificationRepository,
    findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository,
    consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository,
    iunGenerator: () => string = crypto.randomUUID,
    dateGenerator: () => Date = () => new Date()
  ) =>
  (apiKey: ApiKey) =>
  (input: CheckNotificationStatusRecord['input']): TE.TaskEither<Error, CheckNotificationStatusRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(computeSnapshot(occurencesAfterComplete, senderPAId, iunGenerator, dateGenerator)),
          TE.ap(createNotificationRequestRecordRepository.list()),
          TE.ap(findNotificationRequestRecordRepository.list()),
          TE.ap(consumeEventStreamRecordRepository.list()),
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
      TE.map(flow(E.toUnion, (output) => ({ type: 'CheckNotificationStatusRecord' as const, input, output }))),
      TE.chain(findNotificationRequestRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type CheckNotificationStatusUseCase = ReturnType<typeof CheckNotificationStatusUseCase>;
