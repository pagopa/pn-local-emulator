import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { NewNotificationRequest } from '../generated/pnapi/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/pnapi/NewNotificationResponse';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRecord';
import { NewNotificationRecord } from './NewNotificationRecord';

/**
 * Represent the resource created before the Notification itself, a NotificationRequest
 * can possibly become a Notification
 */
export type NotificationRequest = NewNotificationRequest & NewNotificationResponse;

const fillDocIdx = (documents: NotificationRequest['documents']) =>
  pipe(
    documents,
    RA.mapWithIndex((i, doc) => ({ ...doc, docIdx: doc.docIdx || i.toString() }))
  );

/**
 * Make a NotificationRequest given a CreateNotificationRequest record
 */
export const makeNotificationRequestFromCreate = (record: NewNotificationRecord): O.Option<NotificationRequest> =>
  record.output.statusCode === 202
    ? O.some({ ...record.input.body, ...record.output.returned, documents: fillDocIdx(record.input.body.documents) })
    : O.none;

/**
 * Make a NotificationRequest given a FindNotificationRequest record
 */
export const makeNotificationRequestFromFind = (record: CheckNotificationStatusRecord): O.Option<NotificationRequest> =>
  record.output.statusCode === 200 ? O.some({ ...record.output.returned }) : O.none;
