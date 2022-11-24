import { Group } from '../reportengine/reportengine';
import * as CreateEventStreamRecordChecks from './CreateEventStreamRecordChecks';
import * as ConsumeEventStreamRecordChecks from './ConsumeEventStreamRecordChecks';

// This is here just to let it compile. Once the implementation has been completed, this line can be removed.
const mockCheck = () => false;

export const tcSend02 = Group({
  'Configure a stream where you can get the timeline events of a notification': Group({
    'Have you created the stream with the property eventType set to TIMELINE?':
      CreateEventStreamRecordChecks.hasCreatedStreamWithEventTypeTimelineC,
  }),
  'Consume events from a stream': Group({
    'Have you make a request to get the stream with the streamId provided during the creation of the stream?':
      ConsumeEventStreamRecordChecks.requestWithStreamIdProvidedHasBeenMadeC,
    'Have you received the event that confirms the creation of the notification?': Group({
      'Have you received the event with newStatus set to ACCEPTED?':
        ConsumeEventStreamRecordChecks.hasNewStatusPropertySetToAcceptedC,
    }),
    // 'Have you honored the retry-after value?': mockCheck,
    'Have you properly consumed the events coming from the stream?': mockCheck,
  }),
});
