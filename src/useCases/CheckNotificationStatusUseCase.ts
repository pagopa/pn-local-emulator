import * as crypto from 'crypto';
import { pipe, flow } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { authorizeApiKey } from '../domain/authorize';
import {
  CheckNotificationStatusRecord,
  CheckNotificationStatusRecordRepository,
  getNotificationStatusList,
  makeNewNotificationRequestStatusResponse,
} from '../domain/CheckNotificationStatusRepository';
import { getNotifications, NewNotificationRepository } from '../domain/NewNotificationRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';
import {
  ConsumeEventStreamRecordRepository,
  getProgressResponseList,
} from '../domain/ConsumeEventStreamRecordRepository';

const matchRecord = (input: CheckNotificationStatusRecord['input']) => (record: NewNotificationRequestStatusResponse) =>
  'notificationRequestId' in input
    ? record.notificationRequestId === input.notificationRequestId
    : record.paProtocolNumber === input.paProtocolNumber && record.idempotenceToken === input.idempotenceToken;

export const CheckNotificationStatusUseCase =
  (
    numberOfWaitingBeforeComplete: number,
    newNotificationRepository: NewNotificationRepository,
    checkNotificationStatusRecordRepository: CheckNotificationStatusRecordRepository,
    consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository,
    iunGenerator: () => string = crypto.randomUUID
  ) =>
  (apiKey: ApiKey) =>
  (input: CheckNotificationStatusRecord['input']): TE.TaskEither<Error, CheckNotificationStatusRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.of(makeNewNotificationRequestStatusResponse(numberOfWaitingBeforeComplete, iunGenerator)),
          TE.ap(pipe(checkNotificationStatusRecordRepository.list(), TE.map(getNotificationStatusList))),
          TE.ap(pipe(consumeEventStreamRecordRepository.list(), TE.map(getProgressResponseList))),
          TE.map(RA.map),
          TE.ap(pipe(newNotificationRepository.list(), TE.map(getNotifications))),
          TE.map(
            flow(
              RA.findFirst(matchRecord(input)),
              O.map((response) => ({ statusCode: 200 as const, returned: response })),
              O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
            )
          )
        )
      ),
      E.sequence(TE.ApplicativePar),
      TE.map(E.toUnion),
      TE.map((output) => ({ type: 'CheckNotificationStatusRecord' as const, input, output })),
      TE.chain(checkNotificationStatusRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type CheckNotificationStatusUseCase = ReturnType<typeof CheckNotificationStatusUseCase>;
