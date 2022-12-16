import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { Record } from '../domain/Repository';
import { SystemEnv } from './SystemEnv';

export const persistRecord = (env: SystemEnv) => (fn: (list: ReadonlyArray<Record>) => Record) =>
  pipe(env.recordRepository.list(), TE.map(fn), TE.chain(env.recordRepository.insert));
