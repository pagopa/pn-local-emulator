import { flow, pipe } from 'fp-ts/lib/function';
import * as P from 'fp-ts/Predicate';
import * as O from 'fp-ts/Option';
import * as Re from 'fp-ts/Refinement';
import * as RA from 'fp-ts/ReadonlyArray';
import { existsApiKey } from '../Repository';
import { hasApplicationPdfAsContentType, hasUniquePreloadIdx, isPreLoadRecord } from '../PreLoadRepository';

// PreLoadRecord ////////////////////////////////////////////////////////////

export const atLeastOneRequest = {
  'Have you done at least one request?': RA.exists(Re.fromOptionK(isPreLoadRecord)),
};

export const atLeastOneRequestWithUniqueIdx = {
  'Have you done at least one request with unique preloadIdx?': RA.exists(
    flow(isPreLoadRecord, O.exists(hasUniquePreloadIdx))
  ),
};

export const atLeastTwoSlowWithContentTypePdf = {
  'Have you required at least two slots providing the value application/pdf to the contentType property?': flow(
    RA.filterMap(isPreLoadRecord),
    RA.filter(pipe(existsApiKey, P.and(hasApplicationPdfAsContentType))),
    RA.chain(({ input }) => input.body),
    (records) => RA.size(records) >= 2
  ),
};

export const atLeastRequestedTwoValidSlots = {
  'Have you received at least two valid slots?': flow(
    RA.filterMap(isPreLoadRecord),
    RA.filter(pipe(existsApiKey, P.and(hasUniquePreloadIdx), P.and(hasApplicationPdfAsContentType))),
    RA.filter(({ output }) => output.statusCode === 200),
    RA.chain(({ input }) => input.body),
    (records) => RA.size(records) >= 2
  ),
};
