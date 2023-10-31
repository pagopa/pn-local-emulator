import { flow, pipe, identity } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { NonNegativeInteger } from '@pagopa/ts-commons/lib/numbers';
import { ProgressResponse } from '../generated/streams/ProgressResponse';
import { ProgressResponseElement } from '../generated/streams/ProgressResponseElement';
import { NotificationRequest } from './NotificationRequest';
import { Notification } from './Notification';
import { Record, AuditRecord } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { Snapshot, computeSnapshot } from './Snapshot';
import { authorizeApiKey } from './authorize';

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

export const makeProgressResponseElementFromNotification =
  (timestamp: Date) =>
  (notification: Notification): ReadonlyArray<ProgressResponseElement> =>
    pipe(
      notification.timeline,
      RA.map(({ category, legalFactsIds, details }) => ({
        ...makeProgressResponseElementFromNotificationRequest(timestamp)(notification),
        iun: notification.iun,
        newStatus: notification.notificationStatus,
        timelineEventCategory: category,
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

export const makeConsumeEventStreamRecord =
  (env: DomainEnv) =>
  (input: ConsumeEventStreamRecord['input']) =>
  (records: ReadonlyArray<Record>): ConsumeEventStreamRecord => ({
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
          (output) => ({ statusCode: 200 as const, headers: { 'retry-after': env.retryAfterMs }, returned: output })
        )
      )
    ),
    loggedAt: env.dateGenerator(),
  });
