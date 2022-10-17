import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/function';
import { CheckNotificationStatusRecord } from '../CheckNotificationStatusRepository';
import { Checklist } from './types';

export const check0 = {
  name: 'Exists a request that returns 200 as status code',
  eval: RA.some((record: CheckNotificationStatusRecord) => record.output.statusCode === 200),
};

const group = {
  name: 'Check notification status request',
};

export const checkNotificationStatusChecklist: Checklist<ReadonlyArray<CheckNotificationStatusRecord>> = pipe(
  [check0],
  RA.map((check) => ({ ...check, group }))
);
