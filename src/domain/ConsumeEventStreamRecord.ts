/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable functional/no-let */

import { flow, pipe, identity } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { NonNegativeInteger } from '@pagopa/ts-commons/lib/numbers';
import { ProgressResponse } from '../generated/streams/ProgressResponse';
import { ProgressResponseElement } from '../generated/streams/ProgressResponseElement';
import { StreamMetadataResponse } from '../generated/streams/StreamMetadataResponse';
import { makeLogger } from '../logger';
import { NotificationRequest } from './NotificationRequest';
import { Notification } from './Notification';
import { Record, AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { computeSnapshot } from './Snapshot';
import { authorizeApiKey } from './authorize';
import { CreateEventStreamRecord } from './CreateEventStreamRecord';

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


let notificationEventCounter: number = 0;
export const makeProgressResponseElementFromNotification =
  (timestamp: Date) =>
  (notification: Notification): ReadonlyArray<ProgressResponseElement> =>
    pipe(
      notification.timeline,
      RA.map(({ /* category, */ legalFactsIds, details }) => ({
        ...makeProgressResponseElementFromNotificationRequest(timestamp)(notification),
        iun: notification.iun,
        newStatus: notification.notificationStatus,
        timelineEventCategory: notification.timeline[notificationEventCounter++ % 11].category,
        legalFactsIds: legalFactsIds?.map((lf) => lf.key.replaceAll('safestorage://', '')) || [], // Modify the legalFactsIds directly
        recipientIndex: pipe(
          details && 'recIndex' in details ? details.recIndex : undefined,
          NonNegativeInteger.decode,
          E.fold(() => undefined, identity)
        ),
      }))
    );

const makeProgressResponseElementFromNotificationRequest =
  (timestamp: Date) =>
  (notificationRequest: NotificationRequest): ProgressResponseElement => ({
    eventId: '0',
    timestamp,
    notificationRequestId: notificationRequest.notificationRequestId,
    channel: 'B2B',
    analogCost: 325,
  });

const log = makeLogger();
export const makeConsumeEventStreamRecord =
  (env: DomainEnv) =>
  (input: ConsumeEventStreamRecord['input']) =>
  (records: ReadonlyArray<Record>): ConsumeEventStreamRecord => {
    const createEventStreamRecord: CreateEventStreamRecord = records.filter(singleRecord => singleRecord.type === 'CreateEventStreamRecord' && ((singleRecord as CreateEventStreamRecord).output.returned as StreamMetadataResponse).streamId === input.streamId)[0] as CreateEventStreamRecord;
    log.info("STREAM ID: " + (createEventStreamRecord.output.returned as StreamMetadataResponse).streamId);
    const consumeEventStreamRecordCategories: readonly string[] | undefined = (createEventStreamRecord.output.returned as StreamMetadataResponse).filterValues;
    consumeEventStreamRecordCategories?.forEach(singleCategory => log.info("CATEGORY: " + singleCategory));
    log.info("#Categories: ", consumeEventStreamRecordCategories?.length);

    return {
      type: 'ConsumeEventStreamRecord',
      input,
      output: pipe(
        authorizeApiKey(input.apiKey),
        E.foldW(identity, () =>
          pipe(
            computeSnapshot(env)(records) as E.Either<NotificationRequest, Notification>[],
            // create ProgressResponse
            makeProgressResponse(env.dateGenerator()),
            // override the eventId to create a simple cursor based pagination
            RA.mapWithIndex((i, elem) => ({ ...elem, eventId: i.toString() })),
            RA.filterWithIndex((i) => i > parseInt(input.lastEventId || '-1', 10)),
            RA.filterMap((singleEvent) => {
              if (consumeEventStreamRecordCategories?.length === 0) {
                return (singleEvent.timelineEventCategory === "NOTIFICATION_CANCELLATION_REQUEST" || 
                singleEvent.timelineEventCategory === "NOTIFICATION_CANCELLED" || 
                singleEvent.timelineEventCategory === "PREPARE_ANALOG_DOMICILE_FAILURE") ? O.none : O.some(singleEvent);
              }
              
              return consumeEventStreamRecordCategories?.some((singleCategory) => {
                log.info("Comparing category from event: ", (singleEvent as ProgressResponseElement).timelineEventCategory, " with timeline category: ", singleCategory);
                return singleCategory === singleEvent.timelineEventCategory;
              }) ? O.some(singleEvent) : O.none;
            }),
            (output) => ({ statusCode: 200 as const, headers: { 'retry-after': env.retryAfterMs }, returned: output })
          )
        )
      ),
      loggedAt: env.dateGenerator(),
    };
  };