import * as PR from 'io-ts/PathReporter';
import * as T from 'fp-ts/Task';
import * as t from 'io-ts';
import { Response } from 'express';
import { flow } from 'fp-ts/function';
import { unsafeCoerce } from 'fp-ts/function';
import { Problem } from '../../generated/definitions/Problem';

export const toProblem =
  (message: string, status: Problem['status']) =>
  (errors?: t.Errors | Error): Problem => ({
    type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${status}-status-code/`,
    status,
    title: message,
    detail: errors ? (errors instanceof Error ? errors.message : PR.failure(errors)) : message,
    errors: [],
  });

export const sendError = (message: string, status: Problem['status']) => (res: Response) =>
  flow(toProblem(message, status), res.status(status).send, Promise.resolve, T.of);

export const sendSucces = (status: Problem['status']) => (res: Response) =>
  flow(res.status(status).send, Promise.resolve, T.of);

// TODO: find a smarter way to do this
export const HTTP_STATUS: Record<number, Problem['status']> = {
  200: unsafeCoerce(200),
  400: unsafeCoerce(400),
  500: unsafeCoerce(500),
};
