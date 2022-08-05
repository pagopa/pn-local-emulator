import * as TE from 'fp-ts/TaskEither';

export type Repository<A> = {
  insert: (input: A) => TE.TaskEither<Error, A>;

  list: () => TE.TaskEither<Error, ReadonlyArray<A>>;
};
