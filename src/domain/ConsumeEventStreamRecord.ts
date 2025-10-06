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
import { NotificationRequest } from './NotificationRequest';
import { Notification } from './Notification';
import { Record, AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { computeSnapshot } from './Snapshot';
import { authorizeApiKey } from './authorize';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

// ===== Helpers to format and extract values =====
const toNonNegInt = (n: unknown): number | undefined =>
  pipe(NonNegativeInteger.decode(n), E.fold(() => undefined, identity));

const padEventId = (i: number, width = 40): string => i.toString().padStart(width, '0');

const toDate = (d: unknown): Date => (d instanceof Date ? d : new Date(String(d ?? '')));

const sanitizeKey = (k: string) => k.replace(/safestorage:\/\/\/?/g, '')

// ===== Builders (V28 shape: element-first) =====
const makeProgressResponseElementFromNotificationRequest =
  (timestamp: Date) =>
  (notificationRequest: NotificationRequest): ProgressResponseElementV28 => ({
    eventId: '0',
    element: {
      elementId: '0',
      timestamp, // Date
      ingestionTimestamp: timestamp,
      eventTimestamp: timestamp,
      notificationSentAt: timestamp,
    } as any,
    notificationRequestId: notificationRequest.notificationRequestId,
  } as unknown as ProgressResponseElementV28);

export const makeProgressResponseElementFromNotification =
  (timestamp: Date) =>
  (notification: Notification): ReadonlyArray<ProgressResponseElementV28> =>
    pipe(
      notification.timeline,
      RA.map(({ category, legalFactsIds, details }) => {
        // Base record (has notificationRequestId + base element timestamps)
        const base = makeProgressResponseElementFromNotificationRequest(timestamp)(notification);
        const iun = (notification as any).iun as string | undefined;

        const recIndex = toNonNegInt(details && (details as any).recIndex);
        const sentAttemptMade = toNonNegInt(details && (details as any).sentAttemptMade) ?? 0;

        // Build elementId as requested: <CATEGORY>.IUN_<iun>.RECINDEX_<recIndex>.ATTEMPT_<attempt>
        const elementId = `${String(category)}.IUN_${String(iun ?? '')}.RECINDEX_${String(recIndex ?? 0)}.ATTEMPT_${String(sentAttemptMade)}`;

        // Build prepareRequestId similarly for analog flows
        const prepareRequestId = `PREPARE_ANALOG_DOMICILE.IUN_${String(iun ?? '')}.RECINDEX_${String(recIndex ?? 0)}.ATTEMPT_${String(sentAttemptMade)}`;

        const element: any = {
          ...(base as any).element,
          elementId,
          category: category as any,
          // Use provided timestamps if present in details, else fallback to base timestamp
          timestamp: (details as any)?.timestamp ? toDate((details as any).timestamp) : (base as any).element.timestamp,
          ingestionTimestamp: (details as any)?.ingestionTimestamp ? toDate((details as any).ingestionTimestamp) : (base as any).element.ingestionTimestamp,
          eventTimestamp: (details as any)?.eventTimestamp ? toDate((details as any).eventTimestamp) : (base as any).element.eventTimestamp,
          notificationSentAt: (details as any)?.notificationSentAt ? toDate((details as any).notificationSentAt) : (base as any).element.notificationSentAt,
          legalFactsIds: (legalFactsIds ?? []).map((lf: any) => ({ key: sanitizeKey(lf.key) })),
          details: {
            recIndex: recIndex,
            physicalAddress: (details as any)?.physicalAddress,
            sentAttemptMade,
            serviceLevel: (details as any)?.serviceLevel,
            productType: (details as any)?.productType,
            analogCost: (details as any)?.analogCost,
            numberOfPages: (details as any)?.numberOfPages,
            envelopeWeight: (details as any)?.envelopeWeight,
            prepareRequestId: (details as any)?.prepareRequestId ?? prepareRequestId,
          },
        };

        const merged: ProgressResponseElementV28 = {
          ...base,
          iun: iun as any,
          newStatus: (notification as any).notificationStatus as any,
          element,
        } as any;
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

const getCategory = (e: any): string =>
  String(e?.element?.category ?? e?.timelineEventCategory ?? '');

const log = makeLogger();
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
        E.foldW(identity, () =>
          pipe(
            computeSnapshot(env)(records) as E.Either<NotificationRequest, Notification>[],
            makeProgressResponse(env.dateGenerator()),
            // eventId padded like "0000...004786"
            RA.mapWithIndex((i, elem) => ({ ...elem, eventId: padEventId(i) } as any)),
            RA.filterWithIndex((i) => i > parseInt(input.lastEventId || '-1', 10)),
            RA.filterMap((singleEvent) => {
              const cat = getCategory(singleEvent);
              log.info('Single Event category: ', cat);
              if (consumeEventStreamRecordCategories?.length === 0) {
                return (cat === 'NOTIFICATION_CANCELLATION_REQUEST' ||
                  cat === 'NOTIFICATION_CANCELLED' ||
                  cat === 'PREPARE_ANALOG_DOMICILE_FAILURE')
                  ? O.none
                  : O.some(singleEvent);
              }
              return consumeEventStreamRecordCategories?.some((singleCategory) => singleCategory === cat)
                ? O.some(singleEvent)
                : O.none;
            }),
            (output) => ({
              statusCode: 200 as const,
              headers: { 'retry-after': env.retryAfterMs },
              returned: output as unknown as ProgressResponse,
            })
          )
        )
      ),
      loggedAt: env.dateGenerator(),
    };
  };
