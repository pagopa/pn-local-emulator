import * as GetNotificationPriceRecordChecks from '../GetNotificationPriceRecordChecks';
import * as data from '../../__tests__/data';

const ex0 = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];
const ex1 = [...ex0, data.getNotificationPriceRecord];
const ex2 = [data.getNotificationPriceRecord, data.newNotificationRecord];
const ex3 = [
  data.getNotificationPriceRecord,
  data.mkNewNotificationRecord(
    [data.aDocument0],
    [
      {
        ...data.aRecipient,
        payment: data.aRecipient.payment
          ? { ...data.aRecipient.payment, creditorTaxId: data.newNotificationRecord.input.body.senderTaxId }
          : undefined,
      },
    ]
  ),
];

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
    expect(check(ex3)).toStrictEqual(true);
  });
});
