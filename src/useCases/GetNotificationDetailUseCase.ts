import crypto from 'crypto';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import { ApiKey } from '../generated/definitions/ApiKey';
import { Iun } from '../generated/definitions/Iun';
import {
  GetNotificationDetailRecord,
  GetNotificationDetailRecordRepository,
  makeFullSentNotification,
} from '../domain/GetNotificationDetailRepository';
import { authorizeApiKey } from '../domain/authorize';
import { computeSnapshot } from '../domain/Snapshot';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';
import { CheckNotificationStatusRecordRepository } from '../domain/CheckNotificationStatusRepository';
import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';

export const GetNotificationDetailUseCase =
  (
    occurrencesAfterComplete: number,
    repository: GetNotificationDetailRecordRepository,
    createNotificationRequestRecordRepository: NewNotificationRepository,
    findNotificationRequestRecordRepository: CheckNotificationStatusRecordRepository,
    consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository,
    iunGenerator: () => string = crypto.randomUUID
  ) =>
  (apiKey: ApiKey) =>
  (iun: Iun): TE.TaskEither<Error, GetNotificationDetailRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map((_) =>
        pipe(
          TE.of(computeSnapshot(occurrencesAfterComplete, iunGenerator)),
          TE.ap(createNotificationRequestRecordRepository.list()),
          TE.ap(findNotificationRequestRecordRepository.list()),
          TE.ap(consumeEventStreamRecordRepository.list()),
          TE.map(RA.filterMap(O.fromEither)),
          TE.map(RA.findFirstMap((notification) => (notification.iun === iun ? O.some(notification) : O.none))),
          TE.map(O.map(makeFullSentNotification)),
          TE.map(O.map((response) => ({ returned: response, statusCode: 200 as const }))),
          TE.map(O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined })))
        )
      ),
      E.sequence(TE.ApplicativePar),
      TE.map(E.toUnion),
      TE.map((output) => ({ type: 'GetNotificationDetailRecord' as const, input: { iun, apiKey }, output })),
      TE.chain(repository.insert),
      TE.map((record) => record.output)
    );

export type GetNotificationDetailUseCase = ReturnType<typeof GetNotificationDetailUseCase>;
