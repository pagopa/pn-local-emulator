import { flow } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { Repository } from '../../domain/Repository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: ReadonlyArray<E>) =>
  (entity: E) =>
    TE.right([...store, entity]);

const makeRepository =
  (logger: Logger) =>
  <T>(store: ReadonlyArray<T>): Repository<T> => ({
    insert: flow(
      insertEntityTE(store),
      TE.chainFirst((item) => TE.of(logger.debug(`Record item: ${item}`)))
    ),
    list: () => TE.of(store),
  });

export const makePreLoadRepository = makeRepository;

export const makeUploadToS3Repository = makeRepository;
