import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { makeNewNotificationRecord, NewNotificationRecord } from '../domain/NewNotificationRecord';
import { SystemEnv } from './SystemEnv';

export const SendNotificationUseCase =
  (env: SystemEnv) =>
  (apiKey: NewNotificationRecord['input']['apiKey']) =>
  (body: NewNotificationRecord['input']['body']): TE.TaskEither<Error, NewNotificationRecord['output']> =>
    pipe(
      makeNewNotificationRecord(env)({ apiKey, body }),
      env.recordRepository.insert,
      TE.map((record) => record.output)
    );
export type SendNotificationUseCase = ReturnType<typeof SendNotificationUseCase>;
