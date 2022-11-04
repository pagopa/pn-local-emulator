import { flow, pipe } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { existsApiKey } from '../Repository';
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

export const atLeastOneRequest = {
  'Have you done at least one request?': RA.exists(flow(isPreLoadRecord, O.isSome)),
};

export const atLeastOneRequestWithUniqueIdx = {
  'Have you done at least one request with unique preloadIdx?': RA.exists(
    flow(isPreLoadRecord, O.exists(hasUniquePreloadIdx))
  ),
};

export const atLeastTwoRequestWithContentTypePdf = {
  'Have you required at least two slots providing the value application/pdf to the contentType property?': atLeastN(2)(
    pipe(existsApiKey, P.and(hasApplicationPdfAsContentType))
  ),
};

export const atLeastRequestedTwoValidSlots = {
  'Have you received at least two valid slots?': atLeastN(2)(
    pipe(
      existsApiKey,
      P.and(hasUniquePreloadIdx),
      P.and(hasApplicationPdfAsContentType),
      P.and(({ output }) => output.statusCode === 200)
    )
  ),
};
