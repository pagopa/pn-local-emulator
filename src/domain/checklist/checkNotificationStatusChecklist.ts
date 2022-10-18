import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRepository';
import { Checklist } from './types';

export const check0 = {
  name: 'Exists a request that returns 200 as status code',
  eval: RA.some((record: CheckNotificationStatusRecord) => record.output.statusCode === 200),
};

export const check1 = {
  name: 'Exist a request that returns 200 as status code and the "ACCEPTED" as notification request status',
  eval: RA.some(
    (record: CheckNotificationStatusRecord) =>
      record.output.statusCode === 200 && record.output.returned.notificationRequestStatus === 'ACCEPTED'
  ),
};

export const check2 = {
  name: 'Exist a request that returns 200 as status code and the "WAITING" as notification request status',
  eval: RA.some(
    (record: CheckNotificationStatusRecord) =>
      record.output.statusCode === 200 && record.output.returned.notificationRequestStatus === 'WAITING'
  ),
};

const group = {
  name: 'Check notification status request',
};

export const checkNotificationStatusChecklist: Checklist<ReadonlyArray<CheckNotificationStatusRecord>> = pipe(
  [check0, check1, check2],
  RA.map((check) => ({ ...check, group }))
);
