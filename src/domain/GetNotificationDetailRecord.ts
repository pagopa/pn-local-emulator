import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../generated/pnapi/IUN';
import { FullSentNotification } from '../generated/pnapi/FullSentNotification';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { NotificationRequest } from './NotificationRequest';
import { authorizeApiKey } from './authorize';
import { computeSnapshot } from './Snapshot';
import { DomainEnv } from './DomainEnv';
import { updateTimeline } from './TimelineElement';

export type GetNotificationDetailRecord = AuditRecord & {
  type: 'GetNotificationDetailRecord';
  input: { apiKey: string; iun: IUN };
  output: Response<200, FullSentNotification> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export const isGetNotificationDetailRecord = (record: Record): O.Option<GetNotificationDetailRecord> =>
  record.type === 'GetNotificationDetailRecord' ? O.some(record) : O.none;

export const makeFullSentNotification =
  (env: DomainEnv) =>
  (notificationRequest: NotificationRequest) =>
  (iun: IUN): FullSentNotification =>
    pipe(
      {
        ...notificationRequest,
        iun,
        sentAt: env.dateGenerator(),
        notificationStatus: NotificationStatusEnum.ACCEPTED,
        notificationStatusHistory: [],
        documentsAvailable: true,
        timeline: [],
        senderPaId: env.senderPAId,
      },
      (notification) => updateTimeline(env)(notification, NotificationStatusEnum.ACCEPTED)
    );

const exactFullSentNotification = (notification: FullSentNotification): FullSentNotification => ({
  // Remove all the properties not defined by FullSentNotification type
  ...t.exact(FullSentNotification).encode(notification),
  // The encode of FullSentNotification converts Date to a string.
  // Quick workaround: just copy them from the original input
  sentAt: notification.sentAt,
  notificationStatusHistory: notification.notificationStatusHistory,
  timeline: notification.timeline,
});

export const makeGetNotificationDetailRecord =
  (env: DomainEnv) =>
  (input: GetNotificationDetailRecord['input']) =>
  (records: ReadonlyArray<Record>): GetNotificationDetailRecord => ({
    type: 'GetNotificationDetailRecord',
    input,
    loggedAt: env.dateGenerator(),
    output: pipe(
      authorizeApiKey(input.apiKey),
      E.map(() =>
        pipe(
          computeSnapshot(env)(records),
          RA.filterMap(O.fromEither),
          RA.findFirstMap((notification) =>
            notification.iun === input.iun ? O.some(exactFullSentNotification(notification)) : O.none
          ),
          O.map((returned) => ({ statusCode: 200 as const, returned })),
          O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
        )
      ),
      E.toUnion
    ),
  });
