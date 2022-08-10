import express from 'express';
import * as t from 'io-ts';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as PR from 'io-ts/PathReporter';
import { pipe, unsafeCoerce } from 'fp-ts/function';
import { flow } from 'fp-ts/function';
import { Problem } from '../../generated/definitions/Problem';

export const makeAPIProblem =
  (status: number, message: string) =>
  (errors: t.Errors | undefined): Problem => ({
    type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${status}-status-code/`,
    status: unsafeCoerce(status), // TODO Figure why without the cast this doesn't compile
    title: message,
    detail: errors ? PR.failure(errors) : message,
    errors: [],
  });

export const sendResponse =
  (res: express.Response) =>
  <T0, T1>(left: (t0: T0) => express.Response, right: (t1: T1) => express.Response) =>
  (arg: E.Either<t.Errors, TE.TaskEither<T0, T1>>): Promise<express.Response> =>
    pipe(
      E.mapLeft(makeAPIProblem(400, 'Input Error'))(arg),
      E.fold(
        (invalidInput) => Promise.resolve(res.status(400).send(invalidInput)),
        flow(
          TE.fold(
            (l) => TE.of(left(l)),
            (r) => TE.of(right(r))
          ),
          TE.toUnion,
          (te) => te()
        )
      )
    );
