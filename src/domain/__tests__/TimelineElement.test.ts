import { NotificationStatusEnum } from '../../generated/pnapi/NotificationStatus';
import { TimelineElement } from '../../generated/pnapi/TimelineElement';
import { makeLogger } from '../../logger';
import * as RA from 'fp-ts/ReadonlyArray';
import { mkNotification } from '../Notification';
import { NotificationRequest } from '../NotificationRequest';
import { makeNotificationStatusHistory, updateTimeline } from '../TimelineElement';
import * as data from './data';

const log = makeLogger();

describe('makeTimelineList', () => {
  const notifReq = {
    ...data.newNotificationRecord.input.body,
    ...data.newNotificationRecord.output.returned,
    documents: [data.aDocument1],
  } as NotificationRequest;
  const notification = mkNotification(data.makeTestSystemEnv(), notifReq, data.aIun.valid);

  it('same result when given same input', () => {
    const actual1 = updateTimeline(data.makeTestSystemEnv())(notification, NotificationStatusEnum.VIEWED);

    const actual2 = updateTimeline(data.makeTestSystemEnv())(notification, NotificationStatusEnum.VIEWED);

    // Everything should be the same, in particular LegalFactIds should remain the same
    expect(actual1).toEqual(actual2);
  });
});

describe('makeNotificationStatusHistory', () => {
  const notifReq = {
    ...data.newNotificationRecord.input.body,
    ...data.newNotificationRecord.output.returned,
    documents: [data.aDocument1],
  } as NotificationRequest;
  const notification = mkNotification(data.makeTestSystemEnv(), notifReq, data.aIun.valid);

  it("elementId should be '' if value of it is undefined", () => {
    const nTl1 = notification['timeline'] as ReadonlyArray<TimelineElement>;

    nTl1.map((el) => (el['elementId'] = undefined));

    const actual = makeNotificationStatusHistory(data.makeTestSystemEnv())(NotificationStatusEnum.VIEWED, nTl1);

    actual.map((notStatusHist) => {
      expect(notStatusHist['relatedTimelineElements'].every((elementId) => elementId === '')).toEqual(true);
    });
  });

  it('timeline should have value from environment if it is undefined', () => {
    const nTl2 = notification['timeline'] as ReadonlyArray<TimelineElement>;

    nTl2.map((el) => (el['timestamp'] = undefined));

    const actual = makeNotificationStatusHistory(data.makeTestSystemEnv())(NotificationStatusEnum.VIEWED, nTl2);

    actual.map((notStatusHist) => {
      expect(notStatusHist['activeFrom']).not.toStrictEqual(undefined);
    });
  });
});
