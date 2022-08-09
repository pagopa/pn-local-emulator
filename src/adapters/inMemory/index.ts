import { flow, identity } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { PreLoadRecord, PreLoadRecordRepository } from '../../domain/PreLoadRepository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: Array<E>) =>
  (entity: E): TE.TaskEither<Error, E> => {
    store.push(entity);
    return TE.right(entity);
  };

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
