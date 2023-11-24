import {
  getProgressResponse,
  isConsumeEventStreamRecord,
  makeConsumeEventStreamRecord,
  makeProgressResponseElementFromNotification,
} from '../ConsumeEventStreamRecord';
import * as data from './data';
import * as RA from 'fp-ts/ReadonlyArray';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import { mkNotification } from '../Notification';
import { NotificationRequest } from '../NotificationRequest';
import { ProgressResponseElement } from '../../generated/pnapi/ProgressResponseElement';
import { LegalFactsId } from '../../generated/pnapi/LegalFactsId';
import { TimelineElement } from '../../generated/pnapi/TimelineElement';

describe('makeConsumeEventStreamRecord', () => {
  describe('200 responses', () => {
    it('should return an empty array', () => {
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(data.consumeEventStreamRecord.input)([]);
      expect(actual.output.statusCode).toStrictEqual(200);
      expect(actual.output.returned).toStrictEqual([]);
    });

    it('should return an event', () => {
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(data.consumeEventStreamRecord.input)([
        data.newNotificationRecord,
      ]);
      expect(actual.output.statusCode).toStrictEqual(200);
      expect(actual.output.returned).toStrictEqual(data.consumeEventStreamResponse.returned);
    });
  });

  describe('403 response', () => {
    it('should return a 403 response', () => {
      const inputWithBadApiKey = { ...data.consumeEventStreamRecord.input, apiKey: data.apiKey.invalid };
      const actual = makeConsumeEventStreamRecord(data.makeTestSystemEnv())(inputWithBadApiKey)([]);
      expect(actual.output.statusCode).toStrictEqual(403);
    });
  });
});

describe('getProgressResponse', () => {
  it('Progress response if status code 200', () => {
    const actual = getProgressResponse(data.consumeEventStreamRecord);
    const expected = O.some(data.consumeEventStreamRecord.output.returned);
    expect(actual).toStrictEqual(expected);
  });

  it('Progress response if status not 200', () => {
    const cesr = data.consumeEventStreamRecord;
    cesr.output.statusCode = 403;
    const actual = getProgressResponse(cesr);
    expect(actual).toStrictEqual(O.none);
  });
});

describe('isConsumeEventStreamRecord', () => {
  it('if a ConsumeEventStreamRecord should correctly return the object', () => {
    const actual = isConsumeEventStreamRecord(data.consumeEventStreamRecord);
    const expected = O.some(data.consumeEventStreamRecord);
    expect(actual).toStrictEqual(expected);
  });

  it('if not a ConsumeEventStreamRecord should return none', () => {
    const notCesr = isConsumeEventStreamRecord(data.getLegalFactDownloadMetadataRecord);
    expect(notCesr).toStrictEqual(O.none);
  });
});

describe('makeProgressResponseElementFromNotification', () => {
  describe('response validation legalFactsIds', () => {
    const notifReq = {
      ...data.newNotificationRecord.input.body,
      ...data.newNotificationRecord.output.returned,
      documents: [data.aDocument1],
    } as NotificationRequest;
    const notification = mkNotification(data.makeTestSystemEnv(), notifReq, data.aIun.valid);
    const actual = makeProgressResponseElementFromNotification(data.aDate)(notification);

    it("response doesn't contain safestorage:// ", () => {
      pipe(
        actual,
        RA.map((responseElement: ProgressResponseElement) => {
          const re = JSON.parse(JSON.stringify(responseElement));
          pipe(
            re['legalFactsIds'],
            RA.map((lf) => {
              expect(lf).not.toContain('safestorage://');
            })
          );
        })
      );
    });

    it('should have a progress response for every entry in timeline', () => {
      expect(actual.length).toStrictEqual(notification.timeline.length);
    });

    it("legalFactIds should be consistent with notification's one", () => {
      let legalFactListActual: ReadonlyArray<ReadonlyArray<LegalFactsId>> = [];
      pipe(
        actual,
        RA.map((responseElement: ProgressResponseElement) => {
          const re = JSON.parse(JSON.stringify(responseElement));
          legalFactListActual = [...legalFactListActual, re['legalFactsIds'] as ReadonlyArray<LegalFactsId>];
        })
      );
      let legalFactListNotification: ReadonlyArray<ReadonlyArray<LegalFactsId>> = [];
      const dc: TimelineElement[] = JSON.parse(JSON.stringify(notification.timeline));
      pipe(
        dc,
        RA.map((tl: TimelineElement) => {
          const result = tl.legalFactsIds?.map((lf) => lf.key.replaceAll('safestorage://', '')) as LegalFactsId[];
          legalFactListNotification = [...legalFactListNotification, result];
        })
      );
      expect(legalFactListActual).toStrictEqual(legalFactListNotification);
    });

    it('an undefined legalFactId should result into an empty array inside the ProgressResponseElement', () => {
      pipe(
        notification.timeline,
        RA.map((tl) => {
          tl.legalFactsIds = undefined;
        })
      );
      const another = makeProgressResponseElementFromNotification(data.aDate)(notification);
      pipe(
        another,
        RA.map((responseElement: ProgressResponseElement) => {
          const re = JSON.parse(JSON.stringify(responseElement));
          pipe(
            re['legalFactsIds'],
            RA.map((lf) => {
              expect(lf).toStrictEqual([]);
            })
          );
        })
      );
    });
  });
});
