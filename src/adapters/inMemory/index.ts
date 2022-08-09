import { flow } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { PreLoadRecord, PreLoadRecordRepository } from '../../domain/PreLoadRepository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: ReadonlyArray<PreLoadRecord>) =>
  (entity: E) =>
    TE.right([...store, entity]);

export const makePreLoadRepository =
  (logger: Logger) =>
  (store: ReadonlyArray<PreLoadRecord>): PreLoadRecordRepository => ({
    insert: flow(
      insertEntityTE(store),
      TE.chainFirst((item) => TE.of(logger.debug(`Record item: ${item}`)))
    ),
    list: () => TE.of(store),
  });
