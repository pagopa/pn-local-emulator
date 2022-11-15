import { Group } from '../reportengine/reportengine';
import * as CreateEventStreamRecordChecks from './CreateEventStreamRecordChecks';

// This is here just to let it compile. Once the implementation has been completed, this line can be removed.
const mockCheck = () => false;

export const tcSend02 = Group({
  'Configure a stream where you can get the timeline events of a notification': Group({
    'Have you created the stream with the property "eventType" set to "TIMELINE"?':
      CreateEventStreamRecordChecks.hasCreateStreamWithEventTypeTimeline,
  }),
  'Consume events from a stream': Group({
    'Have you make a request to get the stream with the streamId provided during the creation of the stream?':
      mockCheck,
    'Have you honored the "retryAfter" value?': mockCheck,
    'Have you received the event with status "ACCEPTED"?': mockCheck,
  }),
});
