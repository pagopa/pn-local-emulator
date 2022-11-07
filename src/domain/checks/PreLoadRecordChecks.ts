import { flow, pipe } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import {
  hasApplicationPdfAsContentType,
  hasUniquePreloadIdx,
  isPreLoadRecord,
  PreLoadRecord,
} from '../PreLoadRepository';

// PreLoadRecord ////////////////////////////////////////////////////////////

const atLeastN = (n: number) => (fn: (r: PreLoadRecord) => boolean) =>
  flow(
    RA.filterMap(flow(isPreLoadRecord, O.filter(fn))),
    RA.chain(({ input }) => input.body),
    (records) => RA.size(records) >= n
  );

export const atLeastOnePreLoadRecordC = RA.exists(flow(isPreLoadRecord, O.isSome));

export const atLeastOnePreLoadRecordWithPdfC = RA.exists(flow(isPreLoadRecord, O.exists(hasUniquePreloadIdx)));

export const atLeastTwoValidSlotC = atLeastN(2)(
  pipe(
    hasUniquePreloadIdx,
    P.and(hasApplicationPdfAsContentType),
    P.and(({ output }) => output.statusCode === 200)
  )
);
