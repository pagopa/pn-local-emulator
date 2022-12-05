import { Group } from '../reportengine/reportengine';

export const tcSend03 = Group({
  'Have you downloaded the documents related to a notification?': Group({
    'Have you downloaded the notification PDF?': () => false,
    'Have you downloaded the pagoPA PDF?': () => false,
  }),
});
