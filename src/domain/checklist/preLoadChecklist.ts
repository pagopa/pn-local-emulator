import { pipe } from 'fp-ts/lib/function';
import * as s from 'fp-ts/string';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import { PreLoadRecord } from '../PreLoadRepository';
import { Checklist } from './types';

export const check0 = {
  name: 'Exists a response with status code 403',
  eval: RA.some((record: PreLoadRecord) => record.output.statusCode === 403),
};
export const check1 = {
  name: 'Exists a request that contains an api-key',
  eval: RA.some((record: PreLoadRecord) => pipe(record.input.apiKey, O.fromNullable, O.isSome)),
};
export const check2 = {
  name: 'Exists a request whose preloadIdx values are unique within the body',
  eval: RA.some((record: PreLoadRecord) =>
    pipe(
      record.input.body,
      RA.map((elem) => elem.preloadIdx),
      RA.uniq(s.Eq),
      (unique) => unique.length === record.input.body.length
    )
  ),
};
export const check3 = {
  name: "Exists a request whose contentType is always 'application/pdf'",
  eval: RA.some((record: PreLoadRecord) =>
    pipe(
      record.input.body,
      RA.every(({ contentType }) => contentType === 'application/pdf')
    )
  ),
};

const group = {
  name: 'The preload request',
};

export const preLoadChecklist: Checklist<ReadonlyArray<PreLoadRecord>> = pipe(
  [check0, check1, check2, check3],
  RA.map((check) => ({ ...check, group }))
);
