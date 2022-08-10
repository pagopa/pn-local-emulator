import { flow } from 'fp-ts/lib/function';
import { append } from 'fp-ts/lib/ReadonlyArray';
import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as TE from 'fp-ts/TaskEither';
import { Repository } from '../../domain/Repository';
import { Logger } from '../../logger';

export const insertEntityTE =
  <E>(store: ReadonlyArray<E>) =>
  (entity: E): TE.TaskEither<Error, ReadonlyNonEmptyArray<E>> =>
    TE.right(append(entity)(store));

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

export const makeNewNotificationRepository = makeRepository;
