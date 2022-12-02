import { flow, pipe } from 'fp-ts/lib/function';
import * as s from 'fp-ts/string';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { isPreLoadRecord, PreLoadRecord } from '../PreLoadRepository';

// PreLoadRecord ////////////////////////////////////////////////////////////

const hasUniquePreloadIdx = (record: PreLoadRecord) =>
  pipe(
    record.input.body,
    RA.filterMap(({ preloadIdx }) => O.fromNullable(preloadIdx)),
    RA.uniq(s.Eq),
    RA.size,
    (totalUniquePreloadIdx) => totalUniquePreloadIdx === record.input.body.length
  );

export const hasApplicationPdfAsContentType = (record: PreLoadRecord) =>
  pipe(
    record.input.body,
    RA.every(({ contentType }) => contentType === 'application/pdf')
  );

const atLeastN = (n: number) => (fn: (r: PreLoadRecord) => boolean) =>
  flow(
    RA.filterMap(flow(isPreLoadRecord, O.filter(fn))),
    RA.chain(({ input }) => input.body),
    (records) => RA.size(records) >= n
  );

export const atLeastOnePreLoadRecordC = RA.exists(flow(isPreLoadRecord, O.isSome));

export const atLeastOnePreLoadRecordWithPdfC = RA.exists(flow(isPreLoadRecord, O.exists(hasUniquePreloadIdx)));

const validSlot = pipe(
  hasUniquePreloadIdx,
  P.and(hasApplicationPdfAsContentType),
  P.and(({ output }) => output.statusCode === 200)
);

export const atLeastOneValidSlotC = atLeastN(1)(validSlot);

export const atLeastTwoValidSlotC = atLeastN(2)(validSlot);
