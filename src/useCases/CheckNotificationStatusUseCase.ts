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
import { NewNotificationRecord, NewNotificationRepository } from '../domain/NewNotificationRepository';
import { ApiKey } from '../generated/definitions/ApiKey';

const match = (input: CheckNotificationStatusRecord['input']) => (record: NewNotificationRecord) =>
  'notificationRequestId' in input
    ? pipe(
        makeNewNotificationRequestStatusResponse(record),
        O.filter((record) => record.notificationRequestId === input.notificationRequestId)
      )
    : pipe(
        makeNewNotificationRequestStatusResponse(record),
        O.filter((x) => x.paProtocolNumber === input.paProtocolNumber)
      );

export const CheckNotificationStatusUseCase =
  (
    newNotificationRepository: NewNotificationRepository,
    checkNotificationStatusRecordRepository: CheckNotificationStatusRecordRepository
  ) =>
  (apiKey: ApiKey) =>
  (input: CheckNotificationStatusRecord['input']): TE.TaskEither<Error, CheckNotificationStatusRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map((_) =>
        pipe(
          newNotificationRepository.list(),
          TE.map(RA.findFirstMap(match(input))),
          TE.map(O.map((response) => ({ returned: response, statusCode: 200 as const }))),
          TE.map(O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined })))
        )
      ),
      E.sequence(TE.ApplicativePar),
      TE.map(E.toUnion),
      TE.map((output) => ({ type: 'CheckNotificationStatusRecord' as const, input, output })),
      TE.chain(checkNotificationStatusRecordRepository.insert),
      TE.map((record) => record.output)
    );

export type CheckNotificationStatusUseCase = ReturnType<typeof CheckNotificationStatusUseCase>;
