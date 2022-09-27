import * as crypto from 'crypto';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as RA from 'fp-ts/ReadonlyArray';
import { authorizeApiKey } from '../domain/authorize';
import {
  CheckNotificationStatusRecord,
  CheckNotificationStatusRecordRepository,
  makeNewNotificationRequestStatusResponse,
} from '../domain/CheckNotificationStatusRepository';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRequestStatusResponse } from '../generated/definitions/NewNotificationRequestStatusResponse';

const matchRecord = (input: CheckNotificationStatusRecord['input']) => (record: NewNotificationRequestStatusResponse) =>
  'notificationRequestId' in input
    ? pipe(
        record,
        O.fromPredicate((record) => record.notificationRequestId === input.notificationRequestId)
      )
    : pipe(
        record,
        O.fromPredicate((record) => record.paProtocolNumber === input.paProtocolNumber),
        O.filter((record) => record.idempotenceToken === input.idempotenceToken)
      );

export const CheckNotificationStatusUseCase =
  (
    minNumberOfWaitingBeforeDelivering: number,
    newNotificationRepository: NewNotificationRepository,
    checkNotificationStatusRecordRepository: CheckNotificationStatusRecordRepository,
    iunGenerator: () => string = () => crypto.randomUUID()
  ) =>
  (apiKey: ApiKey) =>
  (input: CheckNotificationStatusRecord['input']): TE.TaskEither<Error, CheckNotificationStatusRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map(() =>
        pipe(
          TE.Do,
          TE.apS('nnrList', newNotificationRepository.list()),
          TE.apS('cnsrList', checkNotificationStatusRecordRepository.list()),
          TE.map(({ nnrList, cnsrList }) =>
            pipe(
              nnrList,
              RA.filterMap((record) =>
                makeNewNotificationRequestStatusResponse(
                  minNumberOfWaitingBeforeDelivering,
                  record,
                  cnsrList,
                  iunGenerator
                )
              ),
              RA.findFirstMap(matchRecord(input)),
              O.map((response) => ({ returned: response, statusCode: 200 as const })),
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
