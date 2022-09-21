import * as crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import {
  ConsumeEventStreamRecord,
  ConsumeEventStreamRecordRepository,
  makeProgressResponse,
} from '../domain/ConsumeEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewNotificationRepository } from '../domain/NewNotificationRepository';

export const ConsumeEventStreamUseCase =
  (
    minNumberOfWaitingBeforeDelivering: number,
    consumeEventStreamRepository: ConsumeEventStreamRecordRepository,
    newNotificationRecordRepository: NewNotificationRepository,
    nowDate: () => Date = () => new Date(),
    iunGenerator: () => string = () => crypto.randomUUID()
  ) =>
  (apiKey: ApiKey) =>
  (streamId: string) =>
  (lastEventId?: string): TE.TaskEither<Error, ConsumeEventStreamRecord['output']> =>
    pipe(
      TE.Do,
      TE.apS('cesrList', consumeEventStreamRepository.list()),
      TE.apS('nnrList', newNotificationRecordRepository.list()),
      TE.map(({ cesrList, nnrList }) =>
        makeProgressResponse(minNumberOfWaitingBeforeDelivering, nnrList, cesrList, nowDate, iunGenerator)
      ),
      TE.map((output) =>
        pipe(
          authorizeApiKey(apiKey),
          E.map(() => ({ statusCode: 200 as const, returned: output })),
          E.toUnion
        )
      ),
      TE.map((output) => ({
        type: 'ConsumeEventStreamRecord' as const,
        input: { apiKey, streamId, lastEventId },
        output,
      })),
      TE.chain(consumeEventStreamRepository.insert),
      TE.map(({ output }) => output)
    );

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
