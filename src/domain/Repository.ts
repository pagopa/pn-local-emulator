import { ReadonlyNonEmptyArray } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as TE from 'fp-ts/TaskEither';

export type Repository<A> = {
  insert: (input: A) => TE.TaskEither<Error, ReadonlyNonEmptyArray<A>>;

  list: () => TE.TaskEither<Error, ReadonlyArray<A>>;
};
