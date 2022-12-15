import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { Record } from '../domain/Repository';
import { DomainEnv } from '../domain/DomainEnv';
import { computeSnapshotSlim, Snapshot } from '../domain/Snapshot';
import { SystemEnv } from './SystemEnv';

export const withSnapshot =
  (env: SystemEnv) =>
  <R extends Record, I extends R['input']>(input: I) =>
  (makeRecordFn: (env: DomainEnv) => (snapshot: Snapshot) => (input: I) => R) =>
    pipe(
      env.recordRepository.list(),
      TE.map((records) => makeRecordFn(env)(computeSnapshotSlim(env)(records))(input)),
      TE.chain(env.recordRepository.insert)
    );

export const withoutSnapshot =
  (env: SystemEnv) =>
  <R extends Record, I extends R['input']>(input: I) =>
  (makeRecordFn: (env: DomainEnv) => (input: I) => R) =>
    pipe(makeRecordFn(env)(input), env.recordRepository.insert);
