import { flow } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Repository } from '../../domain/Repository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: Array<E>) =>
  (entity: E): TE.TaskEither<Error, E> => {
    store.push(entity);
    return TE.right(entity);
  };

const makeRepository =
  (logger: Logger) =>
  <T>(snapshot: ReadonlyArray<T>): Repository<T> => {
    const store = snapshot.concat();
    return {
      insert: flow(
        insertEntityTE(store),
        TE.chainFirst((item) => TE.of(logger.debug(`Record item: ${item}`)))
      ),
      list: () => TE.of(store),
    };
  };

export const makePreLoadRepository =
  makeRepository

export const makeUploadToS3Repository =
  makeRepository

export const makeNewNotificationRepository = makeRepository
