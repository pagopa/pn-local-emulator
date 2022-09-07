import express from 'express';
import * as t from 'io-ts';
import * as T from 'fp-ts/Task';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { isObject } from '@pagopa/ts-commons/lib/types';
import * as Problem from './Problem';

export type Handler = (req: express.Request, res: express.Response) => t.Validation<T.Task<express.Response>>;

export const toExpressHandler =
  (handler: Handler): express.Handler =>
  (req, res) =>
    pipe(
      handler(req, res),
      E.mapLeft((errors) => T.of(res.status(400).send(Problem.fromErrors(errors)))),
      E.toUnion,
      (task) => task()
    );

/**
 * Return an object filtering out keys that point to null values.
 */
export const withoutNullValues = <T, K extends keyof T>(obj: T): T => {
  const keys = Object.keys(obj);
  return keys.reduce((acc, key) => {
    const value = obj[key as K];
    return value !== null
      ? {
          ...acc,
          [key]: isObject(value) ? withoutNullValues(value) : value,
        }
      : acc;
  }, {} as T);
};
