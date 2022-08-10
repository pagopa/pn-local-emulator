import { flow } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Repository } from '../../domain/Repository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: E[]) =>
  (entity: E): TE.TaskEither<Error, E> => {
    // eslint-disable-next-line functional/immutable-data
    store.push(entity);
    return TE.right(entity);
  };

const makeRepository =
  (logger: Logger) =>
  <T>(snapshot: ReadonlyArray<T>): Repository<T> => {
    const store = [...snapshot];
    return {
      insert: flow(
        insertEntityTE(store),
        TE.chainFirst((item) => TE.of(logger.debug(`Record item: ${item}`)))
      ),
      list: () => TE.of(store),
    };
  };
export const makePreLoadRepository = makeRepository;

export const makeUploadToS3Repository = makeRepository;

export const makeNewNotificationRepository = makeRepository;
