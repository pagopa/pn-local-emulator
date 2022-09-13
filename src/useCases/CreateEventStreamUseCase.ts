import crypto from 'crypto';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { authorizeApiKey } from '../domain/authorize';
import {
  CreateEventStreamRecord,
  CreateEventStreamRecordRepository,
} from '../domain/CreateEventStreamRecordRepository';
import { ApiKey } from '../generated/definitions/ApiKey';
import { StreamCreationRequest } from '../generated/streams/StreamCreationRequest';

export const CreateEventStreamUseCase =
  (repository: CreateEventStreamRecordRepository) =>
  (apiKey: ApiKey) =>
  (input: StreamCreationRequest): TE.TaskEither<Error, CreateEventStreamRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map((_) => ({ ...input, streamId: crypto.randomUUID(), activationDate: new Date() })),
      E.map((streamMetadataResponse) => ({ statusCode: 200 as const, returned: streamMetadataResponse })),
      E.toUnion,
      (output) => ({
        type: 'CreateEventStreamRecord' as const,
        input: { apiKey, body: input },
        output,
      }),
      repository.insert,
      TE.map(({ output }) => output)
    );

export type CreateEventStreamUseCase = ReturnType<typeof CreateEventStreamUseCase>;
