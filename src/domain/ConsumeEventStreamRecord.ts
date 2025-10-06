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
  // eslint-disable-next-line sonarjs/cognitive-complexity
  (notification: Notification): ReadonlyArray<ProgressResponseElementV28> =>
    pipe(
      notification.timeline,
      RA.map(({ category, legalFactsIds, details }) => {
        const base = makeProgressResponseElementFromNotificationRequest(timestamp)(notification);
        const iun = (notification as unknown as { iun?: string }).iun;

        const d = details as DetailsLike | undefined;
        const recIndex = toNonNegInt(d?.recIndex);
        const sentAttemptMade = toNonNegInt(d?.sentAttemptMade) ?? 0;

        const elementId = `${String(category)}.IUN_${String(iun ?? '')}.RECINDEX_${String(
          recIndex ?? 0
        )}.ATTEMPT_${String(sentAttemptMade)}`;

        const prepareRequestId = `PREPARE_ANALOG_DOMICILE.IUN_${String(iun ?? '')}.RECINDEX_${String(
          recIndex ?? 0
        )}.ATTEMPT_${String(sentAttemptMade)}`;

        const element: ElementLike = {
          ...(base as unknown as { element: ElementLike }).element,
          elementId,
          category,
          timestamp: d?.timestamp ? toDate(d.timestamp) : (base as unknown as { element: ElementLike }).element.timestamp,
          ingestionTimestamp: d?.ingestionTimestamp
            ? toDate(d.ingestionTimestamp)
            : (base as unknown as { element: ElementLike }).element.ingestionTimestamp,
          eventTimestamp: d?.eventTimestamp
            ? toDate(d.eventTimestamp)
            : (base as unknown as { element: ElementLike }).element.eventTimestamp,
          notificationSentAt: d?.notificationSentAt
            ? toDate(d.notificationSentAt)
            : (base as unknown as { element: ElementLike }).element.notificationSentAt,
          legalFactsIds: (legalFactsIds ?? []).map((lf: LegalFactRef) => ({ key: sanitizeKey(lf.key) })),
          details: {
            recIndex,
            physicalAddress: d?.physicalAddress,
            sentAttemptMade,
            serviceLevel: d?.serviceLevel,
            productType: d?.productType,
            analogCost: d?.analogCost,
            numberOfPages: d?.numberOfPages,
            envelopeWeight: d?.envelopeWeight,
            prepareRequestId: d?.prepareRequestId ?? prepareRequestId,
          },
        };

        // Mappatura newStatus per evento (richiesta)
        const cat = String(category);
        const perElementStatus: ProgressResponseElementV28['newStatus'] =
          cat === 'REQUEST_ACCEPTED'
            ? NotificationStatusV26Enum.ACCEPTED
            : cat === 'NOTIFICATION_VIEWED'
              ? NotificationStatusV26Enum.VIEWED
              : cat === 'REFINEMENT'
                ? NotificationStatusV26Enum.DELIVERED
                : NotificationStatusV26Enum.DELIVERING;

        const merged: ProgressResponseElementV28 = {
          ...(base as ProgressResponseElementV28),
          iun: iun as unknown as ProgressResponseElementV28['iun'],
          newStatus: perElementStatus,
          element: element as unknown as ProgressResponseElementV28['element'],
        } as unknown as ProgressResponseElementV28;

        return merged;
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

/** --- Helpers per ridurre la complessità senza cambiare la logica --- */
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

export const makeConsumeEventStreamRecord =
  (env: DomainEnv) =>
  (input: ConsumeEventStreamRecord['input']) =>
  (records: ReadonlyArray<Record>): ConsumeEventStreamRecord => {
    const createEventStreamRecord: CreateEventStreamRecord = records.filter(
      (singleRecord) =>
        singleRecord.type === 'CreateEventStreamRecord' &&
        ((singleRecord as CreateEventStreamRecord).output.returned as StreamMetadataResponse).streamId === input.streamId
    )[0] as CreateEventStreamRecord;

    const consumeEventStreamRecordCategories: readonly string[] | undefined = (
      createEventStreamRecord.output.returned as StreamMetadataResponse
    ).filterValues;

    return {
      type: 'ConsumeEventStreamRecord',
      input,
      output: pipe(
        authorizeApiKey(input.apiKey),
        E.foldW(
          (err) => err,
          () => {
            const snapshot = computeSnapshot(env)(records) as E.Either<NotificationRequest, Notification>[];
            const ts = env.dateGenerator();

            const filtered = pipe(
              snapshot,
              makeProgressResponse(ts),
              RA.mapWithIndex((i, elem) => withEventId(i)(elem as unknown as ProgressResponseElementV28)),
              RA.filterWithIndex((i) => i > parseInt(input.lastEventId || '-1', 10)),
              RA.filter(shouldIncludeByCategories(consumeEventStreamRecordCategories))
            );

            return {
              statusCode: 200 as const,
              headers: { 'retry-after': env.retryAfterMs },
              returned: filtered as unknown as ProgressResponse,
            };
          }
        )
      ),
      loggedAt: env.dateGenerator(),
    };
  };
