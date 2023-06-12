import { makeGetNotificationDetailRecord } from '../GetNotificationDetailRecord';
import * as data from './data';

describe('makeGetNotificationDetailRecord', () => {
  describe('200 responses', () => {
    it('should not return the notificationRequestId property', () => {
      const actual = makeGetNotificationDetailRecord(data.makeTestSystemEnv())({
        apiKey: data.apiKey.valid,
        iun: data.aIun.valid,
      })([
        data.newNotificationRecord,
        data.checkNotificationStatusRecordAccepted,
        data.getNotificationDetailRecordAcceptedWithTimeline,
      ]);
      expect(actual.output.returned).not.toHaveProperty('notificationRequestId');
    });
  });
});
