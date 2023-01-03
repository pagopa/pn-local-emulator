import { Group } from '../reportengine/reportengine';

export const tcPayment02 = Group({
  'Request the notification price of a notification that has a different sender and creditor': Group({
    'Have you created a notification with the following constraints?': Group({
      'Have you filled at least one recipient where the field payment.creditorTaxId is different from the senderTaxId?':
        () => true,
    }),
    'Have you called the endpoint to get the price?': () => true,
  }),
});
