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
  (
    repository: CreateEventStreamRecordRepository,
    streamIdGenerator: () => string = () => crypto.randomUUID(),
    nowDate: () => Date = () => new Date()
  ) =>
  (apiKey: ApiKey) =>
  (input: StreamCreationRequest): TE.TaskEither<Error, CreateEventStreamRecord['output']> =>
    pipe(
      authorizeApiKey(apiKey),
      E.map((_) => ({ ...input, streamId: streamIdGenerator(), activationDate: nowDate() })),
      E.map((streamMetadataResponse) => ({ statusCode: 200 as const, returned: streamMetadataResponse })),
      E.toUnion,
      (output) => ({
        type: 'CreateEventStreamRecord' as const,
        input: { apiKey, body: input },
        output,
      }),
      // this effect here (inserting the record into the repository) may be better handled
      // by the caller: you may consider to extract the insert operation
      // making this method returning the needed structure
      // to the caller that can invoke the use-case within a wrapper, ie:
      // withRepository(<repository>)(CreateEventStreamUseCase)
      //
      // Another option would be to write a simple express middleware
      // that records request and response
      repository.insert,
      TE.map(({ output }) => output)
    );

export type CreateEventStreamUseCase = ReturnType<typeof CreateEventStreamUseCase>;
