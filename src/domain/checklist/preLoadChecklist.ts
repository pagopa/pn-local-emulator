import { pipe } from 'fp-ts/lib/function';
import * as s from 'fp-ts/string';
import * as RA from 'fp-ts/ReadonlyArray';
import * as O from 'fp-ts/Option';
import { PreLoadRecord } from '../PreLoadRepository';
import { Checklist } from './types';

// another way to do this is to split the server part that records
// the use-cases (like you already do) but persists them someway
// (ie. a simple json stored using lowdb is enough)
// then turn these checks into jest tests that read the records from the db.

// The advantage is that you get reporting for free, CI/CD integration,
// IDE support, moreover the devs operates with patterns that they knows well
// and you don't have to call these checks *inside* the recording server so
// the DX is better since devs don't have to restart the server and re-run everything
// in order to add of change some tests. Finally, you don't have to write
// your own logic to implement a test suite.

export const check0 = {
  name: 'Exists a response with status code 403',
  eval: RA.some((record: PreLoadRecord) => record.output.statusCode === 403),
};
export const check1 = {
  name: 'Contains an api-key',
  eval: RA.some((record: PreLoadRecord) => pipe(record.input.apiKey, O.fromNullable, O.isSome)),
};
export const check2 = {
  name: 'preloadIdx values are unique within the body',
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
  name: "contentType is always 'application/pdf'",
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
