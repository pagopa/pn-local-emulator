/* eslint-disable functional/immutable-data */

import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { IUN } from '../generated/pnapi/IUN';
import { FullSentNotificationV27 } from '../generated/pnapi/FullSentNotificationV27';
import { NotificationStatusV26Enum } from '../generated/pnapi/NotificationStatusV26';
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
  output: Response<200, FullSentNotificationV27> | Response<403, UnauthorizedMessageBody> | Response<404>;
};

export const isGetNotificationDetailRecord = (record: Record): O.Option<GetNotificationDetailRecord> =>
  record.type === 'GetNotificationDetailRecord' ? O.some(record) : O.none;

export const makeFullSentNotification =
  (env: DomainEnv) =>
  (notificationRequest: NotificationRequest) =>
  (iun: IUN): FullSentNotificationV27 =>
    pipe(
      {
        ...notificationRequest,
        iun,
        sentAt: env.dateGenerator(),
        notificationStatus: NotificationStatusV26Enum.ACCEPTED,
        notificationStatusHistory: [],
        documentsAvailable: true,
        timeline: [],
        senderPaId: env.senderPAId,
      },
      (notification) => updateTimeline(env)(notification, notification.notificationStatus)
    );

const exactFullSentNotification = (env: DomainEnv, notification: FullSentNotificationV27): FullSentNotificationV27 => ({
  // Limita alle proprietà del codec (rimuove extra)
  ...t.exact(FullSentNotificationV27).encode(notification),
  // Re-inserisce i campi Date e strutture complesse intatte
  notificationStatus: notification.notificationStatus,
  sentAt: notification.sentAt,
  notificationStatusHistory: notification.notificationStatusHistory,
  timeline: notification.timeline,
});

/**
 * Ritorna l'ultimo FullSentNotificationV27 (status 200) per uno specifico IUN, se presente.
 */
const getLatestDetailReturnedForIun =
  (iun: IUN) =>
  (records: ReadonlyArray<Record>): O.Option<FullSentNotificationV27> =>
    pipe(
      records,
      RA.filterMap(isGetNotificationDetailRecord),
      // scegliamo l'ULTIMO in ordine di registrazione
      RA.findLastMap((r) => (r.output.statusCode === 200 && r.input.iun === iun ? O.some(r.output.returned) : O.none))
    );

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
          RA.findFirstMap((notification) => {
            // Se per questo IUN esiste un dettaglio 200 ed è CANCELLED, aggiorna in modo sicuro
            const maybeDetail = getLatestDetailReturnedForIun(notification.iun)(records);

            const notificationPatched = pipe(
              maybeDetail,
              O.filter((d) => d.notificationStatus === NotificationStatusV26Enum.CANCELLED),
              O.map(() => {
                notification.notificationStatus = NotificationStatusV26Enum.CANCELLED;
                notification.cancelledIun = notification.iun;
                notification.notificationStatusHistory = [
                  ...notification.notificationStatusHistory,
                  {
                    status: NotificationStatusV26Enum.CANCELLED,
                    activeFrom: env.dateGenerator(),
                    relatedTimelineElements: [`NOTIFICATION_CANCELLED.IUN_${notification.iun}`],
                  },
                ];
                return notification;
              }),
              O.getOrElseW(() => notification)
            );

            return notificationPatched.iun === input.iun
              ? O.some(exactFullSentNotification(env, notificationPatched))
              : O.none;
          }),
          O.map((returned) => ({ statusCode: 200 as const, returned })),
          O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
        )
      ),
      E.toUnion
    ),
  });
