import * as GetNotificationPriceRecordChecks from '../GetNotificationPriceRecordChecks';
import * as data from '../../__tests__/data';
import { unauthorizedResponse } from '../../types';

const ex0 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];
const ex1 = [...ex0, data.getNotificationPriceRecord];
const ex2 = [data.getNotificationPriceRecord, data.newNotificationRecord];
const ex3 = [
  { ...data.getNotificationPriceRecord, output: unauthorizedResponse },
  data.mkNewNotificationRecord(
    [data.aDocument0],
    [
      {
        ...data.aRecipient,
        payments: data.aRecipient.payments
          ? { ...data.aRecipient.payments }
          : undefined,
      },
    ]
  ),
];
const ex4 = [...ex3, data.getNotificationPriceRecord];

describe('GetNotificationPriceRecordChecks', () => {
  it('atLeastOneGetNotificationPriceRecordC', () => {
    const check = GetNotificationPriceRecordChecks.atLeastOneGetNotificationPriceRecordC;
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(false);
    expect(check(ex1)).toStrictEqual(true);
  });
  it('atLeastOneGetNotificationPriceRecordMatchingPreviousNotificationRequest', () => {
    const check =
      GetNotificationPriceRecordChecks.atLeastOneGetNotificationPriceRecordMatchingPreviousNotificationRequest;
    expect(check([])).toStrictEqual(false);
    expect(check(ex0)).toStrictEqual(false);
    expect(check(ex1)).toStrictEqual(false);
    expect(check(ex2)).toStrictEqual(false);
    // expect(check(ex3)).toStrictEqual(false);
    // expect(check(ex4)).toStrictEqual(true);
  });
});
