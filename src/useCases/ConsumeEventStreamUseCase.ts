import * as TE from 'fp-ts/TaskEither';
import { ConsumeEventStreamRecord } from '../domain/ConsumeEventStreamRecord';
import { SystemEnv } from './SystemEnv';

export const ConsumeEventStreamUseCase =
  (_env: SystemEnv) =>
  (_apiKey: ConsumeEventStreamRecord['input']['apiKey']) =>
  (_streamId: ConsumeEventStreamRecord['input']['streamId']) =>
  (
    _lastEventId?: ConsumeEventStreamRecord['input']['lastEventId']
  ): TE.TaskEither<Error, ConsumeEventStreamRecord['output']> =>
    TE.left(new Error('Not implemented'));

export type ConsumeEventStreamUseCase = ReturnType<typeof ConsumeEventStreamUseCase>;
