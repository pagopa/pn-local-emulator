/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable functional/no-let */

import { flow, pipe, identity } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { NonNegativeInteger } from '@pagopa/ts-commons/lib/numbers';
import { ProgressResponse } from '../generated/pnapi/ProgressResponse';
import { ProgressResponseElementV28 } from '../generated/pnapi/ProgressResponseElementV28';
import { makeLogger } from '../logger';
import { StreamMetadataResponse } from '../generated/pnapi/StreamMetadataResponse';
import { NotificationStatusV26Enum } from '../generated/pnapi/NotificationStatusV26';
import { NotificationRequest } from './NotificationRequest';
import { Notification } from './Notification';
import { Record, AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { computeSnapshot } from './Snapshot';
import { authorizeApiKey } from './authorize';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

type LegalFactRef = { key: string; category?: string };
type PhysicalAddress = {
  address?: string;
  zip?: string;
  municipality?: string;
  province?: string;
};

type DetailsLike = {
  recIndex?: number;
  sentAttemptMade?: number;
  timestamp?: Date | string;
  ingestionTimestamp?: Date | string;
  eventTimestamp?: Date | string;
  notificationSentAt?: Date | string;
  physicalAddress?: PhysicalAddress;
  serviceLevel?: string;
  productType?: string;
  analogCost?: number;
  numberOfPages?: number;
  envelopeWeight?: number;
  prepareRequestId?: string;
};

type ElementLike = {
  elementId: string;
  timestamp: Date;
  ingestionTimestamp?: Date;
  eventTimestamp?: Date;
  notificationSentAt?: Date;
  category?: unknown;
  legalFactsIds?: ReadonlyArray<LegalFactRef>;
  details?: DetailsLike;
};

const toNonNegInt = (n: unknown): number | undefined =>
  pipe(NonNegativeInteger.decode(n), E.fold(() => undefined, identity));

const padEventId = (i: number, width = 40): string => i.toString().padStart(width, '0');

const toDate = (d: unknown): Date => (d instanceof Date ? d : new Date(String(d ?? '')));

const sanitizeKey = (k: string): string => k.replace(/^(safestorage:\/\/)/g, '');

/** --- Helpers di costruzione elemento --- */
const pickDate = (maybe: Date | string | undefined, fallback: Date | undefined): Date | undefined =>
  maybe ? toDate(maybe) : fallback;

/** Mappa categoria → newStatus come nel target richiesto */
const computeStatusFromCategory = (cat: string): NotificationStatusV26Enum => {
  switch (cat) {
    case 'REQUEST_ACCEPTED':
      return NotificationStatusV26Enum.ACCEPTED;
    case 'NOTIFICATION_VIEWED':
      return NotificationStatusV26Enum.VIEWED;
    case 'REFINEMENT':
      return NotificationStatusV26Enum.EFFECTIVE_DATE;
    case 'DIGITAL_SUCCESS_WORKFLOW':
    case 'ANALOG_SUCCESS_WORKFLOW':
      return NotificationStatusV26Enum.DELIVERED;
    default:
      return NotificationStatusV26Enum.DELIVERING;
  }
};

const buildElement = (
  base: ElementLike,
  category: unknown,
  details: DetailsLike | undefined,
  legalFactsIds: ReadonlyArray<LegalFactRef> | undefined,
  iun: string | undefined
): ElementLike => {
  const recIndex = toNonNegInt(details?.recIndex);
  const sentAttemptMade = toNonNegInt(details?.sentAttemptMade) ?? 0;

  const elementId = `${String(category)}.IUN_${String(iun ?? '')}.RECINDEX_${String(
    recIndex ?? 0
  )}.ATTEMPT_${String(sentAttemptMade)}`;

  const prepareRequestId = `PREPARE_ANALOG_DOMICILE.IUN_${String(iun ?? '')}.RECINDEX_${String(
    recIndex ?? 0
  )}.ATTEMPT_${String(sentAttemptMade)}`;

  return {
    ...base,
    elementId,
    category,
    timestamp: pickDate(details?.timestamp, base.timestamp) as Date,
    ingestionTimestamp: pickDate(details?.ingestionTimestamp, base.ingestionTimestamp),
    eventTimestamp: pickDate(details?.eventTimestamp, base.eventTimestamp),
    notificationSentAt: pickDate(details?.notificationSentAt, base.notificationSentAt),
    // Mantiene key sanificata e preserva category (se presente)
    legalFactsIds: (legalFactsIds ?? []).map((lf) =>
      lf.category ? { key: sanitizeKey(lf.key), category: lf.category } : { key: sanitizeKey(lf.key) }
    ),
    details: {
      recIndex,
      physicalAddress: details?.physicalAddress,
      sentAttemptMade,
      serviceLevel: details?.serviceLevel,
      productType: details?.productType,
      analogCost: details?.analogCost,
      numberOfPages: details?.numberOfPages,
      envelopeWeight: details?.envelopeWeight,
      prepareRequestId: details?.prepareRequestId ?? prepareRequestId,
    },
  };
};

const makeProgressResponseElementFromNotificationRequest =
  (timestamp: Date) =>
  (notificationRequest: NotificationRequest): ProgressResponseElementV28 =>
    ({
      eventId: '0',
      element: {
        elementId: '0',
        timestamp,
        ingestionTimestamp: timestamp,
        eventTimestamp: timestamp,
        notificationSentAt: timestamp,
      } as ElementLike,
      notificationRequestId: notificationRequest.notificationRequestId,
    } as unknown as ProgressResponseElementV28);

export const makeProgressResponseElementFromNotification =
  (timestamp: Date) =>
  (notification: Notification): ReadonlyArray<ProgressResponseElementV28> =>
    pipe(
      notification.timeline,
      RA.map(({ category, legalFactsIds, details }) => {
        const base = makeProgressResponseElementFromNotificationRequest(timestamp)(notification);
        const iun = (notification as unknown as { iun?: string }).iun;

        const baseElement = (base as unknown as { element: ElementLike }).element;
        const element = buildElement(baseElement, category, details as DetailsLike | undefined, legalFactsIds, iun);

        const cat = String(category);
        const perElementStatus = computeStatusFromCategory(cat);

        // top-level legalFactsIds solo se non vuoto
        const topLevelLegalFacts: ReadonlyArray<string> = (legalFactsIds ?? []).map((lf) => sanitizeKey(lf.key));

        // Costruisco l'oggetto nello stesso ordine chiavi del target:
        // eventId, element, notificationRequestId, iun, newStatus, [legalFactsIds]
        const mergedBase: ProgressResponseElementV28 = {
          eventId: (base as ProgressResponseElementV28).eventId,
          element: element as unknown as ProgressResponseElementV28['element'],
          notificationRequestId: (base as ProgressResponseElementV28).notificationRequestId,
          iun: iun as unknown as ProgressResponseElementV28['iun'],
          newStatus: perElementStatus,
        } as unknown as ProgressResponseElementV28;

        if (topLevelLegalFacts.length > 0) {
          return {
            ...mergedBase,
            legalFactsIds: topLevelLegalFacts,
          } as unknown as ProgressResponseElementV28;
        }

        return mergedBase;
      })
    );

export type ConsumeEventStreamRecord = AuditRecord & {
  type: 'ConsumeEventStreamRecord';
  input: { apiKey: string; streamId: string; lastEventId?: string };
  output: Response<200, ProgressResponse> | Response<403, UnauthorizedMessageBody> | Response<419>;
};

export const isConsumeEventStreamRecord = (record: Record): O.Option<ConsumeEventStreamRecord> =>
  record.type === 'ConsumeEventStreamRecord' ? O.some(record) : O.none;

export const getProgressResponse = (record: ConsumeEventStreamRecord): O.Option<ProgressResponse> =>
  record.output.statusCode === 200 ? O.some(record.output.returned) : O.none;

export const getProgressResponseList = flow(RA.filterMap(getProgressResponse), RA.flatten);

const makeProgressResponse = (timestamp: Date) =>
  RA.chain(
    E.fold(
      flow(makeProgressResponseElementFromNotificationRequest(timestamp), RA.of),
      makeProgressResponseElementFromNotification(timestamp)
    )
  );

const getCategory = (e: { element?: { category?: string }; timelineEventCategory?: string }): string =>
  String(e?.element?.category ?? e?.timelineEventCategory ?? '');

const log = makeLogger();

/** Helpers per ridurre la complessità senza cambiare la logica */
const EXCLUDED_CATEGORIES = new Set([
  'NOTIFICATION_CANCELLATION_REQUEST',
  'NOTIFICATION_CANCELLED',
  'PREPARE_ANALOG_DOMICILE_FAILURE',
]);

const withEventId =
  (i: number) =>
  (elem: ProgressResponseElementV28): ProgressResponseElementV28 =>
    ({ ...elem, eventId: padEventId(i) } as unknown as ProgressResponseElementV28);

const shouldIncludeByCategories =
  (allowed?: readonly string[]) =>
  (e: { element?: { category?: string }; timelineEventCategory?: string }): boolean => {
    const cat = getCategory(e);
    log.info('Single Event category: ', cat);

    if (!allowed || allowed.length === 0) {
      return !EXCLUDED_CATEGORIES.has(cat);
    }

    return allowed.some((c) => c === cat);
  };

/** Estrae le categorie consentite dal record di creazione (stessa logica di prima) */
const getAllowedCategoriesForStream = (
  records: ReadonlyArray<Record>,
  streamId: string
): readonly string[] | undefined => {
  const createEventStreamRecord: CreateEventStreamRecord = records.filter(
    (singleRecord) =>
      singleRecord.type === 'CreateEventStreamRecord' &&
      ((singleRecord as CreateEventStreamRecord).output.returned as StreamMetadataResponse).streamId === streamId
  )[0] as CreateEventStreamRecord;

  return (createEventStreamRecord.output.returned as StreamMetadataResponse).filterValues;
};

/** Costruisce l'array filtrato dei ProgressResponseElementV28 (stessa logica di prima) */
const buildFilteredProgress = (
  env: DomainEnv,
  input: ConsumeEventStreamRecord['input'],
  records: ReadonlyArray<Record>,
  allowed?: readonly string[]
): ReadonlyArray<ProgressResponseElementV28> => {
  const snapshot = computeSnapshot(env)(records) as E.Either<NotificationRequest, Notification>[];
  const ts = env.dateGenerator();

  return pipe(
    snapshot,
    makeProgressResponse(ts),
    RA.mapWithIndex((i, elem) => withEventId(i)(elem as unknown as ProgressResponseElementV28)),
    RA.filterWithIndex((i) => i > parseInt(input.lastEventId || '-1', 10)),
    RA.filter(shouldIncludeByCategories(allowed))
  );
};

const buildAuthorizedOutput = (
  env: DomainEnv,
  input: ConsumeEventStreamRecord['input'],
  records: ReadonlyArray<Record>
): Response<200, ProgressResponse> => {
  const allowedCategories = getAllowedCategoriesForStream(records, input.streamId);
  const filtered = buildFilteredProgress(env, input, records, allowedCategories);
  return {
    statusCode: 200 as const,
    headers: { 'retry-after': env.retryAfterMs },
    returned: filtered as unknown as ProgressResponse,
  };
};

export const makeConsumeEventStreamRecord =
  (env: DomainEnv) =>
  (input: ConsumeEventStreamRecord['input']) =>
  (records: ReadonlyArray<Record>): ConsumeEventStreamRecord => ({
    type: 'ConsumeEventStreamRecord',
    input,
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.foldW(
        (err) => err,
        () => buildAuthorizedOutput(env, input, records)
      )
    ),
    loggedAt: env.dateGenerator(),
  });
