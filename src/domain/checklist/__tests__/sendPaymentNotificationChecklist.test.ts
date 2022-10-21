import { evalCheck } from '../types';
import { preLoadCheck, uploadToS3Check, createNotificationRequestCheck } from '../sendPaymentNotificationChecklist';
import * as data from '../../__tests__/data';

describe('TC-SEND-01 - Send a notification with a payment document', () => {
  it('should verify the conditions on preLoadRecord', () => {
    const check = evalCheck({ ...preLoadCheck });

    const actual0 = check([data.preLoadRecord]);
    expect(actual0.result).toStrictEqual('ko');

    const actual1 = check([data.preLoadRecord, data.preLoadRecord]);
    expect(actual1.result).toStrictEqual('ok');
  });

  it.skip('should verify the conditions on uploadToS3Record', () => {
    const check = evalCheck({ ...uploadToS3Check });

    const actual0 = check([data.preLoadRecord, data.uploadToS3Record]);
    expect(actual0.result).toStrictEqual('ko');

    const actual1 = check([data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record, data.uploadToS3Record]);
    expect(actual1.result).toStrictEqual('ok');
  });

  it.skip('should verify the conditions on NewNotificationRecord', () => {
    const check = evalCheck({ ...createNotificationRequestCheck });

    const actual0 = check([data.preLoadRecord, data.uploadToS3Record]);
    expect(actual0.result).toStrictEqual('ko');

    const actual1 = check([data.preLoadRecord, data.uploadToS3Record, data.newNotificationRecord]);
    expect(actual1.result).toStrictEqual('ok');
  });
});
