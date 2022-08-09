import { flow } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { PreLoadRecord, PreLoadRecordRepository } from '../../domain/PreLoadRepository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: E[]) =>
  (entity: E): TE.TaskEither<Error, E> =>
    TE.right([...store, entity]);

export const makePreLoadRepository =
  (logger: Logger) =>
  (snapshot: ReadonlyArray<PreLoadRecord>): PreLoadRecordRepository => {
    const store = snapshot.concat();
    return {
      insert: flow(
        insertEntityTE(store),
        TE.chainFirst((item) => TE.of(logger.debug(`Record item: ${item}`)))
      ),
      list: () => TE.of(store),
    };
  };
