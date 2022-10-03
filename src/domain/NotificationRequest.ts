import * as O from 'fp-ts/Option';
import { NewNotificationRequest } from '../generated/definitions/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/definitions/NewNotificationResponse';
import { CheckNotificationStatusRecord } from './CheckNotificationStatusRepository';
import { NewNotificationRecord } from './NewNotificationRepository';

/**
 * Represent the resource created before the Notification itself, a NotificationRequest
 * can possibly become a Notification
 */
export type NotificationRequest = NewNotificationRequest & NewNotificationResponse;

/**
 * Make a NotificationRequest given a CreateNotificationRequest record
 */
export const makeNotificationRequestFromCreate = (record: NewNotificationRecord): O.Option<NotificationRequest> =>
  record.output.statusCode === 202 ? O.some({ ...record.input.body, ...record.output.returned }) : O.none;

/**
 * Make a NotificationRequest given a FindNotificationRequest record
 */
export const makeNotificationRequestFromFind = (record: CheckNotificationStatusRecord): O.Option<NotificationRequest> =>
  record.output.statusCode === 200 ? O.some({ ...record.output.returned }) : O.none;
