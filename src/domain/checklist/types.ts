import { pipe } from 'fp-ts/lib/function';
import * as B from 'fp-ts/lib/boolean';
import * as RA from 'fp-ts/lib/ReadonlyArray';
import { Predicate } from 'fp-ts/lib/Predicate';

export type Check<T> = {
  name: string;
  group: Group;
  eval: Predicate<T>;
};

export type Group = {
  name: string;
};

export type Checklist<T> = ReadonlyArray<Check<T>>;

export type Result = {
  name: string;
  group: Group;
  result: 'ok' | 'ko';
};

export type ChecklistResult = ReadonlyArray<Result>;

// utils //////////////////////////////////////////////////////////////////////

const evalCheck =
  <T>(check: Check<T>) =>
  (input: T): Result =>
    pipe(
      // execute the predicate
      check.eval(input),
      // adapt the result
      B.fold(
        () => 'ko' as const,
        () => 'ok' as const
      ),
      // compose the output
      (result) => ({ name: check.name, group: check.group, result })
    );

export const evalChecklist =
  <T>(checklist: Checklist<T>) =>
  (input: T): ChecklistResult =>
    pipe(
      checklist,
      RA.map((check) => evalCheck(check)(input))
    );
